import type { Metadata } from "next";
import { Comfortaa, Lexend } from 'next/font/google'
import "./globals.css";

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
  return (
    <html lang="en">
      <body className={`${comfortaa.variable} ${lexend.variable} font-primary`}>
        {children}
      </body>
    </html>
  );
}
