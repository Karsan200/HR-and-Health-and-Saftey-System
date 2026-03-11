import React, { createContext, useContext, useState } from "react";
import { DefaultColours } from "./colours";

type ThemeType = typeof DefaultColours;

type ThemeContextType = {
  theme: ThemeType;
  updateTheme: (newColours: Partial<ThemeType>) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: DefaultColours,
  updateTheme: () => {},
});

export function ThemeProvider({ children }: any) {
  const [theme, setTheme] = useState(DefaultColours);

  function updateTheme(newColours: Partial<typeof DefaultColours>) {
    setTheme((prev) => ({
      ...prev,
      ...newColours,
    }));
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}