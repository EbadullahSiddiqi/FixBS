import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixBS | Code Intelligence & Repository Analysis",
  description:
    "AST parsing, dependency graph analysis, and Gemini AI reasoning for JavaScript & TypeScript codebases.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1c1b1b] text-white selection:bg-[#ffeca0]/20 selection:text-[#ffeca0]`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
