import { DefaultColours } from "../theme/colours.ts";

export type ThemeContextType = {
    theme: typeof DefaultColours;

    accessibility: {
      largeText: boolean;
      dyslexicFont: boolean;
      highlightText: boolean;
    };

    updateAccessibility: (settings: any) => void;

    updateTheme: (newColours: Partial<typeof DefaultColours>) => void;
};