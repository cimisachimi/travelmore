// app/layout.tsx
import "./globals.css";
import React from "react";
import { Poppins, Montserrat, Lora } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import Breadcrumbs from "@/components/Breadcrumps";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontPoppins.variable} ${fontMontserrat.variable} ${fontSerif.variable}`}
    >
      <body className="bg- text-foreground font-sans">
        <ThemeProvider>
          <Navbar />
          <Breadcrumbs />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}