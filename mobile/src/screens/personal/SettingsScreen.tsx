import React, { useState } from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';
import { useTheme } from "../../theme/colourController";
import { settingsStyles } from './SettingsScreen.styles';
import { DefaultColours } from "../../theme/colours";
import SwitchToggle from "../../components/SwitchToggle.tsx";

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

export function generateColorSet(primaryHex: string): ColorSet {
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

  const { theme, updateTheme, accessibility, updateAccessibility } = useTheme();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingColor, setEditingColor] = useState<string | null>(null);

  const styles = settingsStyles(theme, accessibility);

  const [highlightSmallText, setHighlightSmallText] = React.useState(false);

  const [pickColors, setPickColors] = useState({
    background: "#F6F6F8",
    text: "#000000",
    accent: "#D20414"
  });

  const [colors, setColors] = useState<ColorSet>({
    primary: "",
    dark: "",
    light: ""
  });

  function applyDefaultTheme() {
    updateTheme(DefaultColours);

    setPickColors({
      background: DefaultColours.greyBackground,
      text: DefaultColours.black,
      accent: DefaultColours.redPrimary
    });

    setPickerVisible(false);
    setEditingColor(null);
  }

  function applyBlueTheme() {
    updateTheme({
      ...DefaultColours,
      redPrimary: "#0066FF",
      redTextDark: "#003A99",
      redBackgroundLight: "#DCE8FF"
    });

    setPickColors({
      background: "#F6F6F8",
      text: "#000000",
      accent: "#0066FF"
    });
    setPickerVisible(false);
    setEditingColor(null);
  }

  function applyGreenTheme() {
    updateTheme({
      ...DefaultColours,
      redPrimary: "#2E7D32",
      redTextDark: "#1B5E20",
      redBackgroundLight: "#C8E6C9"
    });

    setPickColors({
      background: "#F6F6F8",
      text: "#000000",
      accent: "#2E7D32"
    });
    setPickerVisible(false);
    setEditingColor(null);
  }

  function applyDarkTheme() {
    updateTheme({
      // Basic colours
      black: '#FFFFFF',
      white: '#1D1D1D',

      // Basic Red Colours
      redPrimary: '#D20413',
      redTextDark: '#F6CDD0',
      redBackgroundLight: '#AE010B',

      // Traffic Light Colours
      redTrafficPrimary: '#D20414',
      redTrafficTextDark: '#F6CDD0',
      redTrafficBackgroundLight: '#AE010B',

      amberPrimary: '#E8960A',
      amberTextDark: '#FFECCD',
      amberBackgroundLight: '#9B6302',

      greenPrimary: '#14A45A',
      greenTextDark: '#D0EDDE',
      greenBackgroundLight: '#0D7B42',

      greyPrimaryMainText: '#ABABB3', // Main text
      greyIconLight: '#FFFFFF', // Icons and secondary text
      greyBackground: '#101010', // Background of App

      // Miscellaneous colours
      bluePrimary: '#588FFF',
      blueDark: '#E6ECF9',
      blueLight: '#002A80',
    });
    setPickerVisible(false);
    setEditingColor(null);
  }

  function handleHighlightToggle() {
    const newValue = !highlightSmallText;
    setHighlightSmallText(newValue);

    if (newValue) {
      updateTheme({
        greyPrimaryMainText: '#FFEE00',
        black: '#FFEE00',
      })
    } else {
      updateTheme({
        greyPrimaryMainText: '#767676',
        black: '#000000',
      })
    }
  }

  function openPicker(type: "background" | "text" | "accent") {

    if (editingColor === type && pickerVisible) {
      setPickerVisible(false);
      setEditingColor(null);
      return;
    }

    setEditingColor(type);
    setPickerVisible(true);
  }


  function updateColor(hex: string) {

    if (!editingColor) return;

    setPickColors(prev => ({
      ...prev,
      [editingColor]: hex
    }));

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
        black: newColors.dark,
        greyPrimaryMainText: newColors.primary,
        greyIconLight: newColors.light
      });
    }

    if (editingColor === "background") {
      updateTheme({
        greyBackground: newColors.primary,
        white: newColors.light
      });
    }
  }

  const PRESET_COLOURS = ["#D20414", "#0066FF", "#2E7D32", "#D20413"];
  const isCustom = !PRESET_COLOURS.includes(theme.redPrimary);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.quickAccessContainer}>

        {/* Accessibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility Settings</Text>
          {/* TO DO: Toggles for settings*/}

          <View style={styles.settingRow}>
            <View style={styles.smallContainer}>
              <Text style={styles.settingHeader}>
                Dyslexic Font
              </Text>
              <Text style={styles.previewText}>
                Use OpenDyslexic Font.
              </Text>
            </View>
            <SwitchToggle
              value={accessibility.dyslexicFont}
              onToggle={() =>
                updateAccessibility({
                  dyslexicFont: !accessibility.dyslexicFont
                })
              }
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.smallContainer}>
              <Text style={styles.settingHeader}>
                Large Text
              </Text>
              <Text style={styles.previewText}>
                Increase the Text Size.
              </Text>
            </View>
            <SwitchToggle
              value={accessibility.largeText}
              onToggle={() =>
                updateAccessibility({
                  largeText: !accessibility.largeText
                })
              }
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.smallContainer}>
              <Text style={styles.settingHeader}>
                Highlight Text
              </Text>
              <Text style={styles.previewText}>
                Highlights Small Text.
              </Text>
            </View>
            <SwitchToggle
                value={highlightSmallText}
                onToggle={handleHighlightToggle}
            />
          </View>
        </View>

        <View style={styles.section}>

          <Text style={styles.quickAccessTitle}>Colour Themes</Text>

          <View style={styles.schemeGrid}>
            <Pressable testID="theme-default-button" style={[styles.schemeButton, PRESET_COLOURS[0] === theme.redPrimary  && styles.activeScheme]} onPress={applyDefaultTheme}>
              <View style={[styles.schemeSwatch]} />
              <Text style={styles.smallLabel}>Default</Text>
            </Pressable>

            <Pressable testID="theme-blue-button" style={[styles.schemeButton, PRESET_COLOURS[1] === theme.redPrimary && styles.activeScheme]} onPress={applyBlueTheme}>
              <View style={[styles.schemeSwatchBlue]} />
              <Text style={styles.smallLabel}>Blue</Text>
            </Pressable>

            <Pressable testID="theme-green-button"  style={[styles.schemeButton, PRESET_COLOURS[2] === theme.redPrimary && styles.activeScheme]} onPress={applyGreenTheme}>
              <View style={[styles.schemeSwatchGreen]} />
              <Text style={styles.smallLabel}>Green</Text>
            </Pressable>

            <Pressable testID="theme-dark-button"  style={[styles.schemeButton, PRESET_COLOURS[3] === theme.redPrimary && styles.activeScheme]} onPress={applyDarkTheme}>
              <View style={[styles.schemeSwatchDark]} />
              <Text style={styles.smallLabel}>Dark</Text>
            </Pressable>

            <Pressable testID="theme-custom-button" style={[styles.schemeButton, isCustom && styles.activeScheme]}>
              <View style={[styles.schemeSwatchCustom]} />
              <Text style={styles.smallLabel}>Custom</Text>
            </Pressable>
          </View>

          {/* Background Colour */}
          <Text style={styles.label}>Background Colour</Text>
          <Pressable
            style={[
              styles.colourRow,
              editingColor === "background" && styles.activeColourRow
            ]}
            onPress={() => openPicker("background")}
          >
            <View
                style={[
                  styles.colourPreview,
                  { backgroundColor: pickColors.background }
                ]}
            />
            <Text style={styles.smallLabel}>{pickColors.background}</Text>
          </Pressable>

          {/* Text Colour */}
          <Text style={styles.label}>Text Colour</Text>
          <Pressable
            style={[
              styles.colourRow,
              editingColor === "text" && styles.activeColourRow
            ]}
            onPress={() => openPicker("text")}
          >
            <View
                style={[
                  styles.colourPreview,
                  { backgroundColor: pickColors.text }
                ]}
            />
            <Text style={styles.smallLabel}>{pickColors.text}</Text>
          </Pressable>

          {/* Accent Colour */}
          <Text style={styles.label}>Accent Colour</Text>
          <Pressable
            style={[
              styles.colourRow,
              editingColor === "accent" && styles.activeColourRow
            ]}
            onPress={() => openPicker("accent")}
          >
            <View
                style={[
                  styles.colourPreview,
                  { backgroundColor: pickColors.accent }
                ]}
            />
            <Text style={styles.smallLabel}>{pickColors.accent}</Text>
          </Pressable>
        </View>

        {pickerVisible && (
          <View style={styles.pickerDropdown}>

            <Text style={styles.pickerHeader}>
              Editing {editingColor} colour
            </Text>

            <ColorPicker
              color={colors.primary}
              onColorChangeComplete={updateColor}
              thumbSize={40}
              sliderSize={30}
              noSnap={true}
              row={false}
            />

            <View style={styles.previewRow}>

              <View style={[styles.previewBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.previewText}>{colors.primary}</Text>
              </View>

              <View style={[styles.previewBox, { backgroundColor: colors.dark }]}>
                <Text style={styles.previewText}>{colors.dark}</Text>
              </View>

              <View style={[styles.previewBox, { backgroundColor: colors.light }]}>
                <Text style={styles.previewText}>{colors.light}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}