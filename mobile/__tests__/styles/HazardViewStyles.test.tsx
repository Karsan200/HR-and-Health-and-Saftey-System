import { styles } from '../../src/screens/HazardView.styles';
import { DefaultColours } from '../../src/theme/colours';
import { Fonts, FontSize, TextStyles, BorderRadius } from '../../src/theme/theme';

describe('HazardViewStyles', () => {
    const baseAccessibility = { largeText: false, dyslexicFont: false };

    it('returns styles when accessibility not provided', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result).toBeDefined();
    });

    it('screen has correct flex and background', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.screen.flex).toBe(1);
        expect(result.screen.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('container has correct padding and background', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.container.paddingTop).toBe(24);
        expect(result.container.paddingBottom).toBe(48);
        expect(result.container.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('spacer and bottomSpacer have correct heights', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.spacer.height).toBe(4);
        expect(result.bottomSpacer.height).toBe(40);
    });

    it('centeredContainer is correctly centered', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.centeredContainer.flex).toBe(1);
        expect(result.centeredContainer.justifyContent).toBe('center');
        expect(result.centeredContainer.alignItems).toBe('center');
        expect(result.centeredContainer.backgroundColor).toBe(DefaultColours.greyBackground);
        expect(result.centeredContainer.padding).toBe(24);
    });

    it('card has correct styling', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.card.backgroundColor).toBe(DefaultColours.white);
        expect(result.card.marginHorizontal).toBe(16);
        expect(result.card.borderRadius).toBe(12);
        expect(result.card.padding).toBe(14);
        expect(result.card.marginBottom).toBe(12);
        expect(result.card.shadowColor).toBe(DefaultColours.greyIconLight);
        expect(result.card.shadowOpacity).toBe(0.12);
        expect(result.card.shadowRadius).toBe(6);
        expect(result.card.shadowOffset).toEqual({ width: 0, height: 2 });
        expect(result.card.elevation).toBe(4);
    });

    it('cardTitle uses correct font and color', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.cardTitle.fontSize).toBe(FontSize.m20);
        expect(result.cardTitle.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.cardTitle.fontWeight).toBe(TextStyles.medium.fontWeight);
        expect(result.cardTitle.color).toBe(DefaultColours.black);
        expect(result.cardTitle.marginBottom).toBe(8);
    });

    it('field styles are correct', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.fieldWrapper.marginBottom).toBe(12);

        expect(result.fieldLabel.color).toBe(DefaultColours.greyPrimaryMainText);
        expect(result.fieldLabel.marginBottom).toBe(6);
        expect(result.fieldLabel.fontSize).toBe(FontSize.xs14);
        expect(result.fieldLabel.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.fieldLabel.fontWeight).toBe(TextStyles.medium.fontWeight);

        expect(result.fieldBox.borderWidth).toBe(1);
        expect(result.fieldBox.borderColor).toBe(DefaultColours.greyIconLight);
        expect(result.fieldBox.borderRadius).toBe(BorderRadius.smallTextField);
        expect(result.fieldBox.backgroundColor).toBe(DefaultColours.greyBackground);
        expect(result.fieldBox.paddingHorizontal).toBe(12);
        expect(result.fieldBox.paddingVertical).toBe(10);
        expect(result.fieldBox.minHeight).toBe(44);

        expect(result.fieldValue.fontSize).toBe(FontSize.xs14);
        expect(result.fieldValue.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.fieldValue.color).toBe(DefaultColours.greyPrimaryMainText);
    });

    it('checkboxRow and labels have correct styles', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.checkboxRow.flexDirection).toBe('row');
        expect(result.checkboxRow.alignItems).toBe('center');
        expect(result.checkboxRow.marginTop).toBe(6);
        expect(result.checkboxRow.marginBottom).toBe(8);

        expect(result.checkboxLabel.color).toBe(DefaultColours.greyPrimaryMainText);
        expect(result.checkboxLabel.marginLeft).toBe(8);
        expect(result.checkboxLabel.fontSize).toBe(FontSize.xs14);
        expect(result.checkboxLabel.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.checkboxLabel.fontWeight).toBe(TextStyles.medium.fontWeight);

        expect(result.checkboxLabelDisabled.color).toBe(DefaultColours.greyIconLight);
    });

    it('photo section and thumbnails have correct styles', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.photoSection.marginBottom).toBe(12);
        expect(result.photoStrip.flexDirection).toBe('row');
        expect(result.photoStrip.gap).toBe(8);
        expect(result.photoStrip.paddingVertical).toBe(4);

        expect(result.photoThumb.width).toBe(100);
        expect(result.photoThumb.height).toBe(100);
        expect(result.photoThumb.borderRadius).toBe(BorderRadius.smallTextField);
        expect(result.photoThumb.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('errorText and retry styles are correct', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.errorText.color).toBe(DefaultColours.redTrafficPrimary);
        expect(result.errorText.fontSize).toBe(FontSize.xs14);
        expect(result.errorText.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.errorText.textAlign).toBe('center');
        expect(result.errorText.marginBottom).toBe(12);

        expect(result.retryButton.paddingHorizontal).toBe(24);
        expect(result.retryButton.paddingVertical).toBe(10);
        expect(result.retryButton.borderRadius).toBe(BorderRadius.largeButtonsAndOutlines);
        expect(result.retryButton.borderWidth).toBe(1);
        expect(result.retryButton.borderColor).toBe(DefaultColours.redPrimary);

        expect(result.retryText.color).toBe(DefaultColours.redPrimary);
        expect(result.retryText.fontSize).toBe(FontSize.xs14);
        expect(result.retryText.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.retryText.fontWeight).toBe(TextStyles.medium.fontWeight);
    });

    it('applies largeText scaling', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, largeText: true });
        expect(result.cardTitle.fontSize).toBe(FontSize.m20 * 1.3);
        expect(result.fieldLabel.fontSize).toBe(FontSize.xs14 * 1.3);
        expect(result.fieldValue.fontSize).toBe(FontSize.xs14 * 1.3);
        expect(result.checkboxLabel.fontSize).toBe(FontSize.xs14 * 1.3);
        expect(result.errorText.fontSize).toBe(FontSize.xs14 * 1.3);
        expect(result.retryText.fontSize).toBe(FontSize.xs14 * 1.3);
    });

    it('applies dyslexic font family', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
        expect(result.cardTitle.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.fieldLabel.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.fieldValue.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.checkboxLabel.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.errorText.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.retryText.fontFamily).toBe(Fonts.dyslexic.regular);
    });
});