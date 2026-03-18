// Main padding and margin values for consistency
export const Spacing = {
  margin: 24,
  smallPadding: 10,
  mediumPadding: 16,
  largePadding: 24,
};

// All the font sizes that are used in the app
export const FontSize = {
  xxs12: 12,
  xs14: 14,
  s16: 16,
  m20: 20,
  l24: 24,
  xl32: 32,
  xxl36: 36,

};

//Border radius values for different sized components in the app
export const BorderRadius = {
  smallTextField: 4,
  smallTextBackground: 6,
  mediumNotification: 8,
  largeButtonsAndOutlines: 12,
}

// Font families used in the app
export const Fonts = {

  // Default font (Poppins)
  poppins: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    extraBold: 'Poppins-ExtraBold',
  },

  // Accessibility font
  dyslexic: {
    regular: 'OpenDyslexic3-Regular',
    medium: 'OpenDyslexic3-Bold',
    semiBold: 'OpenDyslexic3-Bold',
    bold: 'OpenDyslexic3-Bold',
    extraBold: 'OpenDyslexic3-Bold',
  }

}

// Text styles that combine font family and weight to ensure that the weight sticks to the font
// Default text styles (used as fallback)
export const TextStyles = {
  regular: {
    fontFamily: Fonts.poppins.regular,
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: Fonts.poppins.medium,
    fontWeight: '500' as const,
  },
  semiBold: {
    fontFamily: Fonts.poppins.semiBold,
    fontWeight: '600' as const,
  },
  bold: {
    fontFamily: Fonts.poppins.bold,
    fontWeight: '700' as const,
  },
  extraBold: {
    fontFamily: Fonts.poppins.extraBold,
    fontWeight: '800' as const,
  }
}
