import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { TrainingsProvider } from "@/contexts/TrainingsContext";
import { Toaster } from "@/components/ui/sonner";
import GlobalErrorFilter from "@/components/GlobalErrorFilter";
import ExtensionErrorBlocker from "@/components/ExtensionErrorBlocker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "T&D Webcontinental - Treinamento e Desenvolvimento",
  description: "Plataforma corporativa de treinamento e desenvolvimento Webcontinental",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script 
          src="/error-suppressor.js" 
          strategy="beforeInteractive"
        />
        <ExtensionErrorBlocker />
        <GlobalErrorFilter />
        <AuthProvider>
          <TrainingsProvider>
            {children}
            <Toaster />
          </TrainingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
