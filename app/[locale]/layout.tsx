// app/[locale]/layout.tsx
import "../globals.css";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server'; // ✨ Import getMessages

export const metadata = {
  title: "TravelMore",
};

// ✨ Make the component 'async'
export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // ✨ Explicitly await the messages
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}