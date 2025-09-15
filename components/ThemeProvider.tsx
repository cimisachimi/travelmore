"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { packages as packageData } from "@/data/packages";
import { cars as carData } from "@/data/cars";
import type { Package } from "@/data/packages"; // 👈 import type
import type { Car } from "@/data/cars"; // 👈 import type

type Theme = "regular" | "exclusive";

interface PriceData {
  packages: Package[]; // 👈 use correct type
  cars: Car[]; // 👈 use correct type
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  prices: PriceData;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("regular");

  const prices: PriceData = {
    packages: packageData,
    cars: carData,
  };

  useEffect(() => {
    // Apply the theme class to the html element for global styling
    if (theme === "exclusive") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, prices }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
