import { NextResponse } from 'next/server';
import { ADMIN_ROUTES, PUBLIC_ROUTES, auth } from "@/auth"


const authMiddleware = auth((req) => {
    const { nextUrl } = req;
    const { pathname } = nextUrl;
    const isLoggedIn = !!req.auth;
    const isAdmin = req.auth?.isAdmin;


    // Generate nonce and set CSP headers
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    const cspHeader = `
    default-src 'self';
    connect-src 'self' http://statistiek.rijksoverheid.nl/ppms.php;
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV === "production" ? "" : `'unsafe-eval'`};
    style-src 'self' 'unsafe-inline';
    img-src 'self' http://statistiek.rijksoverheid.nl blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${process.env.NODE_ENV === "production" ? "upgrade-insecure-requests;" : ""}
  `;

    const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();



    const isPublicRoute = PUBLIC_ROUTES.some((route) => {
        if (route.exact) {
            return route.path === pathname;
        }
        return pathname.startsWith(route.path);
    });

    if (pathname === '/api/auth/session') {
        const redirectUrl = new URL(`/`, nextUrl);
        return Response.redirect(redirectUrl);
    }

    const isAPIRoute = pathname.startsWith('/api');

    if (process.env.NODE_ENV === 'development') {
        console.log("middleware", { path: pathname, login: isLoggedIn, isPublicRoute, isAPIRoute, method: req.method });
    }

    if (isAPIRoute) {
        return;
    }

    if (isPublicRoute) {
        const response = NextResponse.next();
        response.headers.set('x-nonce', nonce);
        response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

        return response;
    }

    const isAdminRoute = ADMIN_ROUTES.some((route) => {
        if (route.exact) {
            return route.path === nextUrl.pathname;
        }
        return nextUrl.pathname.startsWith(route.path);
    });

    if (!isLoggedIn) {
        const currentURL = `${nextUrl.pathname}${nextUrl.search}`;
        const encodedURL = encodeURIComponent(currentURL);
        const redirectUrl = new URL(`/auth/login?redirectTo=${encodedURL}`, nextUrl.origin);
        return Response.redirect(redirectUrl);
    }


    if (isAdminRoute && !isAdmin) {
        return Response.redirect(new URL('/auth/admin-account-required', nextUrl));
    }

    const response = NextResponse.next();
    response.headers.set('x-nonce', nonce);
    response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

    return response;
})


export default authMiddleware;

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
    missing: [
        { type: "header", key: "Next-Action" },
    ],
};