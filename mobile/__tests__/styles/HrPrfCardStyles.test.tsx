import { styles } from '../../src/components/HrPdfCard.styles';
import { DefaultColours } from '../../src/theme/colours';

jest.mock('react-native-wheel-color-picker', () => null);

describe('HrPdfCardStyles', () => {

    const baseAccessibility = {
        largeText: false,
        dyslexicFont: false,
    };

    it('returns styles when largeText is false', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, largeText: false });
        expect(result).toBeDefined();
    });

    it('returns styles when largeText is true', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, largeText: true });
        expect(result).toBeDefined();
    });

    it('returns styles when dyslexicFont is false', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: false });
        expect(result).toBeDefined();
    });

    it('returns styles when dyslexicFont is true', () => {
        const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
        expect(result).toBeDefined();
    });

    it('applies all accessibility options simultaneously', () => {
        const result = styles(DefaultColours, { largeText: true, dyslexicFont: true });
        expect(result).toBeDefined();
    });

    it('card has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.card.backgroundColor).toBe(DefaultColours.white);
    });

    it('p60Badge has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.p60Badge.backgroundColor).toBe(DefaultColours.blueLight);
    });

    it('p60Text has correct colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.p60Text.color).toBe(DefaultColours.bluePrimary);
    });

    it('pdfContainer has correct border colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.pdfContainer.borderColor).toBe(DefaultColours.greyIconLight);
    });

    it('pdfContainer has correct height', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.pdfContainer.height).toBe(420);
    });

    it('subtitle has correct colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.subtitle.color).toBe(DefaultColours.greyPrimaryMainText);
    });

    it('cardPressed has reduced opacity', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.cardPressed.opacity).toBe(0.85);
    });
});