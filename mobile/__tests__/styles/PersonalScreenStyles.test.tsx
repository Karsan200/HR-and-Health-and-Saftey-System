import { styles } from '../../src/screens/PersonalScreen.styles';
import { DefaultColours } from '../../src/theme/colours';

describe('PersonalScreenStyles', () => {

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

    it('screen style has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.screen.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('screen style has flex 1', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.screen.flex).toBe(1);
    });

    it('loadingContainer has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.loadingContainer.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('categoryButtonWrapper has white background', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.categoryButtonWrapper.backgroundColor).toBe(DefaultColours.white);
    });

    it('categoryButtonWrapperActive has correct border colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.categoryButtonWrapperActive.borderColor).toBe(DefaultColours.redPrimary);
    });

    it('card has white background', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.card.backgroundColor).toBe(DefaultColours.white);
    });

    it('pdfScreen has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.pdfScreen.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('pdf container has white background', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.pdfContainer.backgroundColor).toBe(DefaultColours.white);
    });

});