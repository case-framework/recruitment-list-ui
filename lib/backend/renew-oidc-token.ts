
export const RenewOIDCToken = async (refreshToken: string, clientId: string, clientSecret: string) => {
    const url = process.env.OIDC_TOKEN_ENDPOINT;

    if (!url) {
        throw new Error('OIDC Token Endpoint not set');
    }

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('scope', 'openid offline_access');
    params.append('refresh_token', refreshToken);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');

    const response = await fetch(url, {
        method: 'POST',
        body: params.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return await response.json();
}
