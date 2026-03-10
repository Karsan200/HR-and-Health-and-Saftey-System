import React, { useState } from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import { useContext } from "react";
import { ThemeContext } from "../../theme/colourController.tsx";
import { settingsStyles } from './SettingsScreen.styles';
import { DefaultColours } from '../../theme/colours.ts';

type HSL = {
  h: number;
  s: number;
  l: number;
};

type ColorSet = {
  primary: string;
  dark: string;
  light: string;
};

function hexToHSL(hex: string): HSL {
  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;

  let r: number;
  let g: number;
  let b: number;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, "0");
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, "0");
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

function generateColorSet(primaryHex: string): ColorSet {
  const { h, s, l } = hexToHSL(primaryHex);

  let lightS = s * 0.6;

  if (l > 65) {
    lightS = Math.min(95, lightS + 70);
  }

  lightS = Math.min(95, Math.max(lightS, 5));

  const light = hslToHex(h, lightS, Math.min(95, l + 35));

  let darkL = l - 25;

  if (l < 30) {
    darkL = l + 15;
  }

  darkL = Math.max(0, Math.min(darkL, 95));

  const dark = hslToHex(h, s, darkL);

  return {
    primary: primaryHex,
    dark,
    light
  };
}

export default function SettingsScreen() {

  console.log("ThemeContext:", useContext(ThemeContext));
  console.warn("ThemeContext:", useContext(ThemeContext));

  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const context = useContext(ThemeContext);
  const theme = context?.theme ?? DefaultColours;
  const updateTheme = context?.updateTheme ?? (() => {});
  const styles = settingsStyles(theme);

  console.log(theme);

  const [pickColors, setPickColors] = useState({
    background: "#EEEEF3",
    text: "#000000",
    accent: "#D20414"
  });

  const [colors, setColors] = useState<ColorSet>({
    primary: "#D20414",
    dark: "#000000",
    light: "#ffffff"
  });

  function openPicker(type: "background" | "text" | "accent") {
    setEditingColor(type);
    setPickerVisible(true);
  }


  function updateColor(hex: string) {

    if (!editingColor) return;

    setPickColors({
      ...pickColors,
      [editingColor]: hex
    });

    const newColors = generateColorSet(hex);
    setColors(newColors);

    if (editingColor === "accent") {
      updateTheme({
        redPrimary: newColors.primary,
        redTextDark: newColors.dark,
        redBackgroundLight: newColors.light
      });
    }

    if (editingColor === "text") {
      updateTheme({
        black: hex,
        greyPrimaryMainText: hex
      });
    }

    if (editingColor === "background") {
      updateTheme({
        greyBackground: hex
      });
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.quickAccessContainer}>

        {/* Accessibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Settings</Text>
          {/* TO DO: Toggles for settings*/}
        </View>

        <View style={styles.section}>

          <Text style={styles.quickAccessTitle}>Colour Themes</Text>

          <View style={styles.schemeGrid}>
            <Pressable style={styles.schemeButton}>
              <Text>Default</Text>
            </Pressable>

            <Pressable style={styles.schemeButton}>
              <Text>Blue</Text>
            </Pressable>

            <Pressable style={styles.schemeButton}>
              <Text>Green</Text>
            </Pressable>

            <Pressable style={styles.schemeButton}>
              <Text>Custom</Text>
            </Pressable>

          </View>

          {/* Background Colour */}
          <Text style={styles.label}>Background Colour</Text>
          <Pressable
              style={styles.colourRow}
              onPress={() => openPicker("background")}
          >
            <View
                style={[
                  styles.colourPreview,
                  { backgroundColor: pickColors.background }
                ]}
            />
            <Text>{pickColors.background}</Text>
          </Pressable>

          {/* Text Colour */}
          <Text style={styles.label}>Text Colour</Text>
          <Pressable
              style={styles.colourRow}
              onPress={() => openPicker("text")}
          >
            <View
                style={[
                  styles.colourPreview,
                  { backgroundColor: pickColors.text }
                ]}
            />
            <Text>{pickColors.text}</Text>
          </Pressable>

          {/* Accent Colour */}
          <Text style={styles.label}>Accent Colour</Text>
          <Pressable
              style={styles.colourRow}
              onPress={() => openPicker("accent")}
          >
            <View
                style={[
                  styles.colourPreview,
                  { backgroundColor: pickColors.accent }
                ]}
            />
            <Text>{pickColors.accent}</Text>
          </Pressable>
        </View>

          {pickerVisible && (
            <View style={{ marginTop: 30 }}>
              <ColorPicker
                color={colors.primary}
                onColorChangeComplete={updateColor}
                thumbSize={40}
                sliderSize={30}
                noSnap={true}
                row={false}
              />
            </View>
          )}

          <View style={{ flexDirection: "row", marginTop: 20 }}>

            <View
              style={{
                flex: 1,
                height: 60,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text>{colors.primary}</Text>
            </View>

            <View
              style={{
                flex: 1,
                height: 60,
                backgroundColor: colors.dark,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text>{colors.dark}</Text>
            </View>

            <View
              style={{
                flex: 1,
                height: 60,
                backgroundColor: colors.light,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text>{colors.light}</Text>
            </View>
          </View>
        </View>

    </ScrollView>
  );
}