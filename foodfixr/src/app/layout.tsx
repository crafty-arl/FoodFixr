import type { Metadata } from "next";
import { Comfortaa, Lexend } from 'next/font/google'
import "./globals.css";
import { initializeCookieStore } from '@/lib/cookies'

const comfortaa = Comfortaa({ 
  subsets: ['latin'],
  variable: '--font-comfortaa'
})

const lexend = Lexend({ 
  subsets: ['latin'],
  variable: '--font-lexend'
})

export const metadata: Metadata = {
  title: "Food Fixr",
  description: "Your personal nutrition companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize cookie store on the client side
  if (typeof window !== 'undefined') {
    initializeCookieStore()
  }

  return (
    <html lang="en">
      <body className={`${comfortaa.variable} ${lexend.variable} font-primary`}>
        {children}
      </body>
    </html>
  );
}
