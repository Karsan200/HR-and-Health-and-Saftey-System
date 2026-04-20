import { ButtonActionBarStyles } from '../../src/components/ButtonActionBar.styles';
import { DefaultColours } from '../../src/theme/colours';
import { Fonts, FontSize, TextStyles } from '../../src/theme/theme';

describe('ButtonActionBarStyles', () => {
    const baseAccessibility = { largeText: false, dyslexicFont: false };

    it('returns styles when accessibility not provided', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result).toBeDefined();
    });

    it('container is positioned at bottom with correct zIndex, elevation, and alignment', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result.container.position).toBe('absolute');
        expect(result.container.left).toBe(0);
        expect(result.container.right).toBe(0);
        expect(result.container.bottom).toBe(0);
        expect(result.container.zIndex).toBe(999);
        expect(result.container.elevation).toBe(10);
        expect(result.container.alignItems).toBe('center');
        expect(result.container.overflow).toBe('visible');
    });

    it('card has correct layout, background, padding, minHeight, width, shadow and elevation', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result.card.flexDirection).toBe('row');
        expect(result.card.backgroundColor).toBe(DefaultColours.white);
        expect(result.card.borderRadius).toBe(0);
        expect(result.card.paddingHorizontal).toBe(12);
        expect(result.card.paddingVertical).toBe(12);
        expect(result.card.minHeight).toBe(80);
        expect(result.card.width).toBe('100%');
        expect(result.card.shadowColor).toBe(DefaultColours.greyPrimaryMainText);
        expect(result.card.shadowOpacity).toBe(100);
        expect(result.card.shadowRadius).toBe(10);
        expect(result.card.elevation).toBe(10);
    });

    it('button has correct flex and margin', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result.button.flex).toBe(1);
        expect(result.button.marginHorizontal).toBe(6);
    });

    it('label has correct font family, weight, size, and vertical alignment', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result.label.fontFamily).toBe(Fonts.poppins.medium);
        expect(result.label.fontWeight).toBe(TextStyles.medium.fontWeight);
        expect(result.label.fontSize).toBe(FontSize.s16);
        expect(result.label.textAlignVertical).toBe('center');
    });

    it('primaryLabel has correct color', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result.primaryLabel.color).toBe(DefaultColours.white);
    });

    it('buttonContent centers content with correct height and padding', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result.buttonContent.height).toBe(55);
        expect(result.buttonContent.justifyContent).toBe('center');
        expect(result.buttonContent.alignItems).toBe('center');
        expect(result.buttonContent.paddingVertical).toBe(0);
    });

    it('saveButton and submitButton have correct background colors', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result.saveButton.backgroundColor).toBe(DefaultColours.white);
        expect(result.submitButton.backgroundColor).toBe(DefaultColours.redPrimary);
    });

    it('saveLabel and submitLabel have correct text colors', () => {
        const result = ButtonActionBarStyles(DefaultColours, baseAccessibility);
        expect(result.saveLabel.color).toBe(DefaultColours.black);
        expect(result.submitLabel.color).toBe(DefaultColours.white);
    });

    it('applies largeText scaling', () => {
        const result = ButtonActionBarStyles(DefaultColours, { ...baseAccessibility, largeText: true });
        expect(result.label.fontSize).toBe(FontSize.s16 * 1.3);
    });

    it('applies dyslexic font family', () => {
        const result = ButtonActionBarStyles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
        expect(result.label.fontFamily).toBe(Fonts.dyslexic.medium);
    });
});