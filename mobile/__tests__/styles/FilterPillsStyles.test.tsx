import { styles } from '../../src/components/FilterPills.styles.ts';
import { DefaultColours } from '../../src/theme/colours';
import { Fonts, FontSize, TextStyles, BorderRadius } from '../../src/theme/theme';

describe('FilterPillStyles', () => {
    const baseAccessibility = { largeText: false, dyslexicFont: false };

    it('returns styles when accessibility not provided', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result).toBeDefined();
    });

    it('container has correct layout and gap', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.container.flexDirection).toBe('row');
        expect(result.container.gap).toBe(8);
    });

    it('pill has correct padding, border radius and color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.pill.paddingHorizontal).toBe(14);
        expect(result.pill.paddingVertical).toBe(6);
        expect(result.pill.borderRadius).toBe(BorderRadius.largeButtonsAndOutlines);
        expect(result.pill.borderWidth).toBe(1);
        expect(result.pill.borderColor).toBe(DefaultColours.greyIconLight);
    });

    it('pillActive overrides border color and width', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.pillActive.borderColor).toBe(DefaultColours.redPrimary);
        expect(result.pillActive.borderWidth).toBe(1.5);
    });

    it('text has correct font, weight, size, and color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.text.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.text.fontWeight).toBe(TextStyles.regular.fontWeight);
        expect(result.text.fontSize).toBe(FontSize.xxs12);
        expect(result.text.color).toBe(DefaultColours.greyPrimaryMainText);
    });

    it('textActive overrides font weight and color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.textActive.fontWeight).toBe(TextStyles.semiBold.fontWeight);
        expect(result.textActive.color).toBe(DefaultColours.black);
    });

    it('applies largeText scaling', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, largeText: true });
        expect(result.text.fontSize).toBe(FontSize.xxs12 * 1.3);
    });

    it('applies dyslexic font family', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
        expect(result.text.fontFamily).toBe(Fonts.dyslexic.regular);
    });
});