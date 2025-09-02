// app/[locale]/layout.tsx
import "./globals.css";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export const metadata = {
  title: "TravelMore",
};

// ✨ Make the component 'async'
export default async function RootLayout({
  children,

}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  return (
    <html>
      <body className="bg-background text-foreground">

        <Navbar />
        <main>{children}</main>
        <Footer />

      </body>
    </html>
  );
}