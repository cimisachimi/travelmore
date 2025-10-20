// app/[locale]/layout.tsx
import "./globals.css";
import React from "react";
import { Poppins, Montserrat, Lora } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
// Remove the direct import of Breadcrumbs:
// import Breadcrumbs from "@/components/Breadcrumps";
// Import the new wrapper component:
import ClientBreadcrumbsWrapper from "@/components/ui/ClientBreadcrumbsWrapper";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
// Import Provider

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
  children, params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html
      lang={locale} // Use the actual locale variable
      className={`${fontPoppins.variable} ${fontMontserrat.variable} ${fontSerif.variable}`}
    >
      <body className="bg-background text-foreground font-sans"> {/* Use bg-background */}
        <AuthProvider>
          <NextIntlClientProvider>
            <ThemeProvider>
              <Navbar />
              {/* Replace the original Breadcrumbs component with the wrapper */}
              <ClientBreadcrumbsWrapper />
              <main>{children}</main>
              <Footer />
            </ThemeProvider>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}