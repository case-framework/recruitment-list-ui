import NextAuth from "next-auth"
import "next-auth"

import { Provider } from "next-auth/providers"
import { extendSessionRequest, getRenewTokenRequest, signInWithIdPRequest } from "./lib/backend/auth-methods";
import { RenewOIDCToken } from "./lib/backend/renew-oidc-token";
import MSEntraIDProvider from "next-auth/providers/microsoft-entra-id";


export const PUBLIC_ROUTES = [
    { path: '/', exact: true },
    { path: '/auth/login', exact: true },
]

export const ADMIN_ROUTES = [
    { path: '/home/user-management', exact: false },
]


const MsEntraIDProvider = MSEntraIDProvider({
    id: "oidc-provider",
    name: "MS Entra ID",
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    tenantId: process.env.MS_ENTRA_TENANT_ID,
    authorization: { params: { scope: "openid email profile offline_access" } },
    profile: (profile) => {
        return {
            sub: profile.sub,
            name: profile.name,
            roles: profile.roles,
            email: profile.email,
            image: profile.picture,
        }
    }
})




const providers: Provider[] = [
    MsEntraIDProvider,
    /*{
        id: "oidc-provider", // signIn("my-provider") and will be part of the callback URL
        name: "Signicat", // optional, used on the default login page as the button text.
        type: "oidc", // or "oauth" for OAuth 2 providers
        issuer: process.env.OIDC_ISSUER, // to infer the .well-known/openid-configuration URL
        clientId: process.env.OIDC_CLIENT_ID, // from the provider's dashboard
        clientSecret: process.env.OIDC_CLIENT_SECRET, // from the provider's dashboard
        authorization: { params: { scope: "openid email profile offline_access" } },
        profile: (profile) => {
            return {
                sub: profile.sub,
                name: profile.name,
                roles: profile.roles,
                email: profile.email,
                image: profile.picture,
            }
        }
    }*/
]

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    providers: providers,
    trustHost: true,
    basePath: '/api/auth',
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (account) {
                token.provider = account.provider;
                if (account.provider === 'oidc-provider') {
                    if (!user.sub) {
                        return {
                            error: 'LoginFailed' as const
                        }
                    }

                    try {
                        const response = await signInWithIdPRequest({
                            sub: user.sub,
                            name: user.name || undefined,
                            email: user.email || undefined,
                            imageURL: user.image || undefined,
                            roles: [], // we don't accept admin claim from idp now
                            renewToken: process.env.DISABLE_TOKEN_REFRESH === 'true' ? undefined : account.refresh_token
                        })
                        token.CASESessionID = response.sessionID
                        token.CASEaccessToken = response.accessToken
                        token.expiresAt = response.expiresAt
                        token.renewSessionAt = Math.floor((response.expiresAt + (Date.now() / 1000)) / 2)
                        token.isAdmin = response.isAdmin
                    } catch (e) {
                        console.error(e)
                        return {
                            error: 'LoginFailed' as const
                        }
                    }
                    token.user = {
                        name: user.name,
                        email: user.email,
                        image: user.image
                    }
                    return token
                }
                return token
            } else if (token.renewSessionAt !== undefined && Date.now() > token.renewSessionAt * 1000) {
                if (token.provider === 'oidc-provider') {

                    if (process.env.DISABLE_TOKEN_REFRESH === 'true') {
                        console.debug('Refreshing token is disabled');
                        return {
                            ...token,
                            error: 'RefreshAccessTokenError' as const,
                        }
                    }
                    console.log('refreshing token');

                    if (!token.CASEaccessToken || !token.CASESessionID) {
                        console.error('No token or session id found')
                        return {
                            ...token,
                            error: 'RefreshAccessTokenError' as const,
                        }
                    }

                    // get refresh token from CASE session
                    try {
                        const resp = await getRenewTokenRequest(token.CASEaccessToken, token.CASESessionID)

                        if (!resp.renewToken) {
                            return token;
                        }

                        // renew token by azure ad
                        const refreshTokenResp = await RenewOIDCToken(
                            resp.renewToken,
                            process.env.OIDC_CLIENT_ID || '',
                            process.env.OIDC_CLIENT_SECRET || '',
                        );
                        const newRenewToken = refreshTokenResp.refresh_token;

                        if (!newRenewToken) {
                            return token;
                        }

                        // get new JWT from CASE backend
                        const newTokenResp = await extendSessionRequest(token.CASEaccessToken, newRenewToken);
                        token.CASEaccessToken = newTokenResp.accessToken;
                        token.CASESessionID = newTokenResp.sessionID;
                        token.expiresAt = newTokenResp.expiresAt;
                        token.renewSessionAt = (process.env.DISABLE_TOKEN_REFRESH === 'true') ? newTokenResp.expiresAt : Math.floor((newTokenResp.expiresAt + (Date.now() / 1000)) / 2);
                        token.isAdmin = newTokenResp.isAdmin;

                        return token;
                    } catch (e) {
                        // console.error(e)
                        return token;
                    }
                }
                return token
            }
            return token
        },
        async session({ session, token }) {
            session.CASEaccessToken = token.CASEaccessToken;
            session.tokenExpiresAt = token.expiresAt;
            session.isAdmin = token.isAdmin;
            return session
        }
    },
    logger: {
        debug: (...args) => console.log(...args),
        error: (...args) => console.error(...args),
        warn: (...args) => console.warn(...args),
    }
})

declare module "next-auth" {
    interface User {
        sub?: string;
        roles?: string[];
    }

    interface Session {
        CASESessionID?: string;
        CASEaccessToken?: string;
        isAdmin?: boolean;
        tokenExpiresAt?: number;
    }

}

declare module "@auth/core/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        provider?: string
        CASEaccessToken?: string
        CASESessionID?: string
        expiresAt?: number
        renewSessionAt?: number
        isAdmin?: boolean
        error?: "RefreshAccessTokenError" | "LoginFailed"
    }
}
