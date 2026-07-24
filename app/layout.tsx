import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./global-overrides.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Send Signal",
  description: "WhatsApp outreach automation platform for personalized campaigns at scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
