import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIF.yoga Research Assistant",
  description: "AI-powered research and content generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">
              SIF.yoga Research Assistant
            </h1>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t">
            <div className="container mx-auto p-4 max-w-4xl text-center text-sm text-gray-500">
              AI responses may be inaccurate. Please verify against original
              sources.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
