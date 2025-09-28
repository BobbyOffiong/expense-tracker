import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xpen$eTraka",
  description: "Take charge of your finances.",
  manifest: "/manifest.json", // 👈 tells Next.js where the manifest lives
  themeColor: "#046A38", // 👈 used by browsers when app is installed
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 👇 fallback link for manifest + theme color */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#046A38" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <ServiceWorkerProvider />
      </body>
    </html>
  );
}
