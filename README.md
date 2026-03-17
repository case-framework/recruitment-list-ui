This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Recovery Mode Admin Login

The login flow supports a recovery-mode override for emergency access.

Set the `RECOVERY_MODE_EMAIL` environment variable to a single email address. When this variable is defined and a user logs in with the same email address, the application includes the `ADMIN` role in the roles array sent during login.

Behavior:

- If `RECOVERY_MODE_EMAIL` is unset, recovery mode is disabled and no extra role is granted.
- If `RECOVERY_MODE_EMAIL` is set, only the matching user gets the `ADMIN` role during sign-in.
- Email matching is case-insensitive and ignores surrounding whitespace.

Example:

```env
RECOVERY_MODE_EMAIL=admin@example.com
```

This flag should remain unset during normal operation and only be enabled temporarily for account recovery or emergency administrative access.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
