import React from "react";
import { render, act } from "@testing-library/react-native";
import { ThemeProvider, useTheme } from "../src/theme/colourController";
import { DefaultColours } from "../src/theme/colours";
import { renderHook } from '@testing-library/react-native';

// Helper component to test the hook
const HookTester = ({ callback }: { callback: (themeHook: ReturnType<typeof useTheme>) => void }) => {
  const themeHook = useTheme();
  callback(themeHook);
  return null;
};

describe("ThemeProvider and useTheme", () => {
  it("provides default theme values", () => {
    let hookResult: ReturnType<typeof useTheme> | undefined;

    render(
      <ThemeProvider>
        <HookTester callback={(result) => { hookResult = result; }} />
      </ThemeProvider>
    );

    expect(hookResult).toBeDefined();
    expect(hookResult?.theme).toEqual(DefaultColours);
    expect(typeof hookResult?.updateTheme).toBe("function");
  });

  it("updates theme correctly when updateTheme is called", () => {
    let hookResult: ReturnType<typeof useTheme> | undefined;

    render(
      <ThemeProvider>
        <HookTester callback={(result) => { hookResult = result; }} />
      </ThemeProvider>
    );

    act(() => {
      hookResult?.updateTheme({ black: "#111111" });
    });

    expect(hookResult?.theme.black).toBe("#111111");
    // Ensure other colours are unchanged
    expect(hookResult?.theme.white).toBe(DefaultColours.white);
  });

  it("returns default theme if no provider is present", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toEqual(DefaultColours);
  });
});