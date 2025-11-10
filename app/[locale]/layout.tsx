// app/[locale]/layout.tsx
import "./globals.css";
import React from "react";
import { Poppins, Montserrat, Lora } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import ClientBreadcrumbsWrapper from "@/components/ui/ClientBreadcrumbsWrapper";

// ✅ 1. Import 'NextIntlClientProvider' (NOT 'useMessages')
import { hasLocale, NextIntlClientProvider } from "next-intl";

// ✅ 2. Import 'getMessages' to load messages on the server
import { getMessages } from 'next-intl/server'; 

import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
// Font configurations remain the same...
const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const fontMontserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const fontSerif = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
});
export const metadata = {
  title: "TravelMore",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // ✅ Mark params as Promise
}) {
  const { locale } = await params; // ✅ Await destructure

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fontPoppins.variable} ${fontMontserrat.variable} ${fontSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ThemeProvider>
              <Navbar />
              <ClientBreadcrumbsWrapper />
              <main>{children}</main>
              <Footer />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
