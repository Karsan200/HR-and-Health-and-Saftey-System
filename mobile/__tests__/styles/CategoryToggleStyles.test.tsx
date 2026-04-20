import { styles } from '../../src/components/CategoryToggle.styles';
import { DefaultColours } from '../../src/theme/colours';
import { Fonts, FontSize, TextStyles, BorderRadius, Spacing } from '../../src/theme/theme';

describe('CategoryToggleStyles', () => {
    const baseAccessibility = { largeText: false, dyslexicFont: false };

    it('returns styles when accessibility not provided', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result).toBeDefined();
    });

    it('container has correct layout and spacing', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.container.flexDirection).toBe('row');
        expect(result.container.marginHorizontal).toBe(Spacing.mediumPadding);
        expect(result.container.marginTop).toBe(16);
        expect(result.container.marginBottom).toBe(12);
        expect(result.container.gap).toBe(10);
    });

    it('buttonWrapper has correct border, background, minHeight, and shadow', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.buttonWrapper.flex).toBe(1);
        expect(result.buttonWrapper.borderRadius).toBe(BorderRadius.largeButtonsAndOutlines);
        expect(result.buttonWrapper.borderWidth).toBe(2);
        expect(result.buttonWrapper.borderColor).toBe('transparent');
        expect(result.buttonWrapper.backgroundColor).toBe(DefaultColours.white);
        expect(result.buttonWrapper.minHeight).toBe(90);
        expect(result.buttonWrapper.justifyContent).toBe('center');
        expect(result.buttonWrapper.shadowColor).toBe(DefaultColours.greyIconLight);
        expect(result.buttonWrapper.shadowOpacity).toBe(1);
        expect(result.buttonWrapper.shadowRadius).toBe(4);
        expect(result.buttonWrapper.elevation).toBe(4);
    });

    it('buttonWrapperActive sets correct borderColor', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.buttonWrapperActive.borderColor).toBe(DefaultColours.redPrimary);
    });

    it('button has correct padding and alignment', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.button.paddingVertical).toBe(16);
        expect(result.button.paddingHorizontal).toBe(12);
        expect(result.button.alignItems).toBe('center');
        expect(result.button.justifyContent).toBe('center');
    });

    it('buttonText has correct font, weight, size, color, and alignment', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.buttonText.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.buttonText.fontWeight).toBe(TextStyles.regular.fontWeight);
        expect(result.buttonText.fontSize).toBe(FontSize.s16);
        expect(result.buttonText.color).toBe(DefaultColours.greyPrimaryMainText);
        expect(result.buttonText.textAlign).toBe('center');
    });

    it('buttonTextActive has correct fontWeight and color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.buttonTextActive.fontWeight).toBe(TextStyles.semiBold.fontWeight);
        expect(result.buttonTextActive.color).toBe(DefaultColours.black);
    });

    it('buttonWrapperCompact has correct minHeight and justifyContent', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.buttonWrapperCompact.minHeight).toBe(70);
        expect(result.buttonWrapperCompact.justifyContent).toBe('center');
    });

    it('buttonCompact has correct paddingVertical', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.buttonCompact.paddingVertical).toBe(10);
    });

    it('applies largeText scaling', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, largeText: true });
        expect(result.buttonText.fontSize).toBe(FontSize.s16 * 1.3);
    });

    it('applies dyslexic font family', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
        expect(result.buttonText.fontFamily).toBe(Fonts.dyslexic.regular);
    });
});