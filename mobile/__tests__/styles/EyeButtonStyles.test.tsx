import { styles } from '../../src/components/EyeButton.styles';
import { DefaultColours } from '../../src/theme/colours';
import { Fonts, FontSize, TextStyles, BorderRadius } from '../../src/theme/theme';

describe('EyeButtonStyles', () => {
    const baseAccessibility = { largeText: false, dyslexicFont: false };

    it('returns styles when accessibility not provided', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result).toBeDefined();
    });

    it('button has correct layout, padding, border radius, and minHeight', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.button.flexDirection).toBe('row');
        expect(result.button.alignItems).toBe('center');
        expect(result.button.justifyContent).toBe('center');
        expect(result.button.borderRadius).toBe(BorderRadius.largeButtonsAndOutlines);
        expect(result.button.paddingVertical).toBe(6);
        expect(result.button.paddingHorizontal).toBe(12);
        expect(result.button.minHeight).toBe(50);
    });

    it('label has correct font, weight, size, color, and margin', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.label.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.label.fontWeight).toBe(TextStyles.semiBold.fontWeight);
        expect(result.label.fontSize).toBe(FontSize.xs14);
        expect(result.label.color).toBe(DefaultColours.white);
        expect(result.label.marginLeft).toBe(6);
    });

    it('active style sets correct background color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.active.backgroundColor).toBe(DefaultColours.redPrimary);
    });

    it('inactive style sets correct background color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.inactive.backgroundColor).toBe(DefaultColours.greyPrimaryMainText);
    });

    it('applies largeText scaling', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, largeText: true });
        expect(result.label.fontSize).toBe(FontSize.xs14 * 1.3);
    });

    it('applies dyslexic font family', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
        expect(result.label.fontFamily).toBe(Fonts.dyslexic.regular);
    });
});