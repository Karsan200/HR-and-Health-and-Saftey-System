import { styles } from '../../src/components/RiskCard.styles';
import { DefaultColours } from '../../src/theme/colours';
import { Fonts, FontSize, TextStyles, Spacing, BorderRadius } from '../../src/theme/theme';

describe('RiskCardStyles', () => {
    const baseAccessibility = { largeText: false, dyslexicFont: false };

    it('returns styles when accessibility not provided', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result).toBeDefined();
    });

    it('card has correct background, border radius, padding, shadow, and margin', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.card.backgroundColor).toBe(DefaultColours.white);
        expect(result.card.borderRadius).toBe(BorderRadius.largeButtonsAndOutlines);
        expect(result.card.paddingVertical).toBe(Spacing.mediumPadding);
        expect(result.card.paddingHorizontal).toBe(Spacing.mediumPadding);
        expect(result.card.marginBottom).toBe(Spacing.mediumPadding);
        expect(result.card.shadowColor).toBe(DefaultColours.greyIconLight);
        expect(result.card.shadowOffset).toEqual({ width: 0, height: 0 });
        expect(result.card.shadowOpacity).toBe(1);
        expect(result.card.shadowRadius).toBe(4);
        expect(result.card.elevation).toBe(4);
    });

    it('badge has correct layout, padding, and margin', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.badge.alignSelf).toBe('flex-start');
        expect(result.badge.borderRadius).toBe(BorderRadius.smallTextBackground);
        expect(result.badge.paddingHorizontal).toBe(8);
        expect(result.badge.paddingVertical).toBe(2);
        expect(result.badge.marginBottom).toBe(6);
    });

    it('badge status backgrounds are correct', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.badgeDraft.backgroundColor).toBe(DefaultColours.greyBackground);
        expect(result.badgeSubmitted.backgroundColor).toBe(DefaultColours.amberBackgroundLight);
        expect(result.badgeClosed.backgroundColor).toBe(DefaultColours.greenBackgroundLight);
    });

    it('badgeText has correct font, weight, and size', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.badgeText.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.badgeText.fontWeight).toBe(TextStyles.semiBold.fontWeight);
        expect(result.badgeText.fontSize).toBe(FontSize.xxs12);
    });

    it('badgeText colors per status are correct', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.badgeTextDraft.color).toBe(DefaultColours.greyPrimaryMainText);
        expect(result.badgeTextSubmitted.color).toBe(DefaultColours.amberTextDark);
        expect(result.badgeTextClosed.color).toBe(DefaultColours.greenTextDark);
    });

    it('title has correct font, weight, size, color, and margin', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.title.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.title.fontWeight).toBe(TextStyles.semiBold.fontWeight);
        expect(result.title.fontSize).toBe(FontSize.m20);
        expect(result.title.color).toBe(DefaultColours.black);
        expect(result.title.marginBottom).toBe(2);
    });

    it('subheading has correct font, weight, size, color, and margin', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.subheading.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.subheading.fontWeight).toBe(TextStyles.regular.fontWeight);
        expect(result.subheading.fontSize).toBe(FontSize.s16);
        expect(result.subheading.color).toBe(DefaultColours.greyPrimaryMainText);
        expect(result.subheading.marginBottom).toBe(2);
    });

    it('date has correct font, weight, size, color, and margin', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.date.fontFamily).toBe(Fonts.poppins.regular);
        expect(result.date.fontWeight).toBe(TextStyles.regular.fontWeight);
        expect(result.date.fontSize).toBe(FontSize.xxs12);
        expect(result.date.color).toBe(DefaultColours.greyPrimaryMainText);
        expect(result.date.marginBottom).toBe(Spacing.mediumPadding);
    });

    it('applies largeText scaling', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, largeText: true });
        expect(result.badgeText.fontSize).toBe(FontSize.xxs12 * 1.3);
        expect(result.title.fontSize).toBe(FontSize.m20 * 1.3);
        expect(result.subheading.fontSize).toBe(FontSize.s16 * 1.3);
        expect(result.date.fontSize).toBe(FontSize.xxs12 * 1.3);
    });

    it('applies dyslexic font family', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
        expect(result.badgeText.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.title.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.subheading.fontFamily).toBe(Fonts.dyslexic.regular);
        expect(result.date.fontFamily).toBe(Fonts.dyslexic.regular);
    });
});