import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppBackground from "@/components/app-background";
import { cn } from "@/lib/utils";
import { ConfirmDialogProvider } from "@/components/c-ui/confirm-provider";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export async function generateMetadata(): Promise<Metadata> {

  return {
    title: {
      default: 'Recruitment List App',
      template: `%s | Recruitment List App`,
    },
    description: 'Recruitment List application to facilitate data access and contact management',
    metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  }
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        geistSans.variable,
        geistMono.variable,
        'h-screen flex flex-col antialiased'
      )}>
        <AppBackground />
        <TRPCReactProvider>
          <ConfirmDialogProvider>
            {children}
            <Toaster />
          </ConfirmDialogProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
