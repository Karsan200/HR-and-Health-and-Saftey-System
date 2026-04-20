import { styles } from '../../src/screens/DocumentsScreen.styles';
import { DefaultColours } from '../../src/theme/colours';

jest.mock('react-native-wheel-color-picker', () => null);

describe('DocumentsScreenStyles', () => {

    const baseAccessibility = {
        largeText: false,
        dyslexicFont: false,
    };

    it('returns styles when accessibility not provided', () => {
        const result = styles(DefaultColours);
        expect(result).toBeDefined();
    });

    it('returns styles when accessibility provided', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result).toBeDefined();
    });

    it('screen has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.screen.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('screen has flex 1', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.screen.flex).toBe(1);
    });

    it('loadingContainer has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.loadingContainer.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('card has white background', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.card.backgroundColor).toBe(DefaultColours.white);
    });

    it('cardTitle uses black text', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.cardTitle.color).toBe(DefaultColours.black);
    });

    it('signedBadgeText uses green primary colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.signedBadgeText.color).toBe(DefaultColours.greenTextDark);
    });

    it('unsignedBadgeText uses red primary colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.unsignedBadgeText.color).toBe(DefaultColours.redTrafficTextDark);
    });

    it('pdf background is white', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.pdf.backgroundColor).toBe(DefaultColours.white);
    });

    it('acknowledgeText uses black text', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.acknowledgeText.color).toBe(DefaultColours.black);
    });

    it('pdfHeader has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.pdfHeader.backgroundColor).toBe(DefaultColours.greyBackground);
    });


    it('applies normal font scale when largeText is false', () => {
      const result = styles(DefaultColours, { ...baseAccessibility, largeText: false });
      expect(result).toBeDefined();
    });

    it('applies large font scale when largeText is true', () => {
      const result = styles(DefaultColours, { ...baseAccessibility, largeText: true });
      expect(result).toBeDefined();
    });

    it('applies normal font family when dyslexicFont is false', () => {
      const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: false });
      expect(result).toBeDefined();
    });

    it('applies dyslexic font family when dyslexicFont is true', () => {
      const result = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
      expect(result).toBeDefined();
    });

    it('applies all accessibility options simultaneously', () => {
      const result = styles(DefaultColours, {
        largeText: true,
        dyslexicFont: true,
      });
      expect(result).toBeDefined();
    });
});