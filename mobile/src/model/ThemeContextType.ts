import { DefaultColours } from "../theme/colours.ts";

export type ThemeContextType = {
    theme: typeof DefaultColours;
    updateTheme: (newColours: Partial<typeof DefaultColours>) => void;
};