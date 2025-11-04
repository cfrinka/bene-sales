import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vendas Bene Brasil",
  description: "Sistema para gerenciamento de vendas e estoque em eventos",
  icons: {
    icon: [
      {
        url: `/favicon.ico?v=${Date.now()}`,
        type: "image/x-icon",
      },
    ],
    shortcut: `/favicon.ico?v=${Date.now()}`,
    apple: `/favicon.ico?v=${Date.now()}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
