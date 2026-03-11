import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ThemeProvider, useTheme } from "../src/theme/colourController"; // adjust path
import { DefaultColours } from "../src/theme/colours";
import { Button, Text } from 'react-native';

// Helper component to test the hook
function TestComponent() {
  const { theme, updateTheme } = useTheme();

  return (
    <>
      <Text testID="background">{theme.greyBackground}</Text>
      <Text testID="accent">{theme.redPrimary}</Text>
      <Button
        testID="updateBackground"
        title="Update Background"
        onPress={() => updateTheme({ greyBackground: "#123456" })}
      />
      <Button
        testID="updateAccent"
        title="Update Accent"
        onPress={() => updateTheme({ redPrimary: "#ABCDEF" })}
      />
    </>
  );
}

describe("ThemeProvider and useTheme", () => {
  it("provides default theme initially", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(getByTestId("background").props.children).toBe(DefaultColours.greyBackground);
    expect(getByTestId("accent").props.children).toBe(DefaultColours.redPrimary);
  });

  it("updates theme correctly when updateTheme is called", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Update background
    fireEvent.press(getByTestId("updateBackground"));
    expect(getByTestId("background").props.children).toBe("#123456");

    // Update accent
    fireEvent.press(getByTestId("updateAccent"));
    expect(getByTestId("accent").props.children).toBe("#ABCDEF");
  });
});