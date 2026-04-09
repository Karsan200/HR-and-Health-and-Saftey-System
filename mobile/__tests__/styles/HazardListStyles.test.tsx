import { styles } from '../../src/screens/HazardList.styles';
import { DefaultColours } from '../../src/theme/colours';
import { Fonts, FontSize, TextStyles, Spacing } from '../../src/theme/theme';

describe('HazardListStyles', () => {
    const baseAccessibility = { largeText: false, dyslexicFont: false };

    it('returns styles when accessibility not provided', () => {
        const result = styles(DefaultColours);
        expect(result).toBeDefined();
    });

    it('returns styles when accessibility provided', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result).toBeDefined();
    });

    it('screen has correct background color and flex', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.screen.backgroundColor).toBe(DefaultColours.greyBackground);
        expect(result.screen.flex).toBe(1);
    });

    it('loadingContainer is centered with correct background', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.loadingContainer.backgroundColor).toBe(DefaultColours.greyBackground);
        expect(result.loadingContainer.justifyContent).toBe('center');
        expect(result.loadingContainer.alignItems).toBe('center');
        expect(result.loadingContainer.flex).toBe(1);
    });

    it('errorContainer has correct padding and background', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.errorContainer.backgroundColor).toBe(DefaultColours.greyBackground);
        expect(result.errorContainer.paddingHorizontal).toBe(Spacing.mediumPadding);
        expect(result.errorContainer.justifyContent).toBe('center');
        expect(result.errorContainer.alignItems).toBe('center');
        expect(result.errorContainer.flex).toBe(1);
    });

    it('errorText uses correct font family, weight, size, color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.errorText.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.errorText.fontWeight).toBe(TextStyles.regular.fontWeight);
        expect(result.errorText.fontSize).toBe(FontSize.s16);
        expect(result.errorText.color).toBe(DefaultColours.greyPrimaryMainText);
        expect(result.errorText.textAlign).toBe('center');
        expect(result.errorText.marginBottom).toBe(12);
    });

    it('retryText uses correct font family, weight, size, color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.retryText.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.retryText.fontWeight).toBe(TextStyles.semiBold.fontWeight);
        expect(result.retryText.fontSize).toBe(FontSize.s16);
        expect(result.retryText.color).toBe(DefaultColours.redPrimary);
    });

    it('countsRow has correct layout, padding, gap and margin', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.countsRow.flexDirection).toBe('row');
        expect(result.countsRow.paddingHorizontal).toBe(Spacing.mediumPadding);
        expect(result.countsRow.gap).toBe(10);
        expect(result.countsRow.marginBottom).toBe(14);
    });

    it('listContent has correct padding and gap', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.listContent.paddingHorizontal).toBe(Spacing.mediumPadding);
        expect(result.listContent.paddingBottom).toBe(24);
        expect(result.listContent.gap).toBe(12);
    });

    it('applies largeText scaling', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, largeText: true });
        expect(result.errorText.fontSize).toBe(FontSize.s16 * 1.3);
        expect(result.retryText.fontSize).toBe(FontSize.s16 * 1.3);
    });

    it('applies dyslexic font family', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
        expect(result.errorText.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.retryText.fontFamily).toBe(Fonts.dyslexic.regular);
    });
});