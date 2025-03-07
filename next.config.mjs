/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb'
        }
    },
    async headers() {
        return [
            {
                source: '/(.*?)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: process.env.HEADER_X_FRAME_OPTIONS || 'SAMEORIGIN',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: process.env.HEADER_PERMISSIONS_POLICY || 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ]
    },
};

export default nextConfig;
