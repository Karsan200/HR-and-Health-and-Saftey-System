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

// Font family names for the Poppins font in different weights, used throughout the app
export const Fonts = {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    extraBold: 'Poppins-ExtraBold',
}

// Text styles that combine font family and weight to ensure that the weight sticks to the font
export const TextStyles = {
    regular: {
        fontFamily: Fonts.regular,
        fontWeight: '400' as const,
    },
    medium: {
        fontFamily: Fonts.medium,
        fontWeight: '500' as const,
    },
    semiBold: {
        fontFamily: Fonts.semiBold,
        fontWeight: '600' as const,
    },
    bold: {
        fontFamily: Fonts.bold,
        fontWeight: '700' as const,
    },
    extraBold: {
        fontFamily: Fonts.extraBold,
        fontWeight: '800' as const,
    }
}
