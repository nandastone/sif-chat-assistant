import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Research & Writing Assistant",
  description: "AI-powered research analysis and article generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="[color-scheme:light_dark]">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
