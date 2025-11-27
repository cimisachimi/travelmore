import "./globals.css";
import React from "react";
import { Poppins, Montserrat, Lora } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from 'next-intl/server';
import { Toaster } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import ClientBreadcrumbsWrapper from "@/components/ui/ClientBreadcrumbsWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { routing } from "@/i18n/routing";

// --- Font Configurations ---
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
  title: "TravelMore - Explore Yogyakarta",
  description: "Plan your personalized trip to Yogyakarta with ease.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params for Next.js 15+ compatibility
  const { locale } = await params;

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Load translations based on locale
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fontPoppins.variable} ${fontMontserrat.variable} ${fontSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col min-h-screen">
                <Navbar />
                
                {/* Breadcrumbs wrapper (Optional: adjust padding if needed) */}
                <ClientBreadcrumbsWrapper />
                
                <main className="flex-grow">
                  {children}
                </main>
                
                <Footer />
              </div>
              
              {/* Toast Notification */}
              <Toaster richColors closeButton position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}