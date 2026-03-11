
/*
Defines the theme object for the application,
including spacing, font sizes, border radii, and text styles.
 */
export const theme = {
  spacing: {
    margin: 24,
    smallPadding: 10,
    mediumPadding: 16,
    largePadding: 24,
  },
  fontSize: {
    xxs12: 12,
    xs14: 14,
    s16: 16,
    m20: 20,
    l24: 24,
    xl32: 32,
    xxl36: 36,

  },
  borderRadius: {
    smallTextField: 4,
    smallTextBackground: 6,
    mediumNotification: 8,
    largeButtonsAndOutlines: 12,
  },
  textStyles: {
    regular: {
      fontFamily: 'Poppins-Regular',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Poppins-Medium',
      fontWeight: '500' as const,
    },
    semiBold: {
      fontFamily: 'Poppins-SemiBold',
      fontWeight: '600' as const,
    },
    bold: {
      fontFamily: 'Poppins-Bold',
      fontWeight: '700' as const,
    },
    extraBold: {
      fontFamily: 'Poppins-ExtraBold',
      fontWeight: '800' as const,
    }
  }
}