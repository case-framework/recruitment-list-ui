import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppBackground from "@/components/app-background";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

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
        inter.className,
        'h-screen flex flex-col antialiased'
      )}>
        <AppBackground />
        {children}
      </body>
    </html>
  );
}
