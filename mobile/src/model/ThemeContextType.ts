import { DefaultColours } from "../theme/colours.ts";

export type ThemeContextType = {
    theme: DefaultColours;
    updateTheme: (newColours: Partial<DefaultColours>) => void;
};