import React, { createContext, useState } from "react";
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

    function updateTheme(newColours: any) {
        setTheme((prev: any) => ({
            ...prev,
            ...newColours
        }));
    }

    return (
        <ThemeContext.Provider value={{ theme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}