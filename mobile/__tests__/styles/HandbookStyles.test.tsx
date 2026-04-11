import { styles } from '../../src/screens/HandbookScreen.styles';
import { DefaultColours } from '../../src/theme/colours';

jest.mock('react-native-wheel-color-picker', () => null);

describe('HandbookScreenStyles', () => {

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

    it('scrollView has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.scrollView.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('scrollView has flex 1', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.scrollView.flex).toBe(1);
    });

    it('loadingContainer has correct background colour', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.loadingContainer.backgroundColor).toBe(DefaultColours.greyBackground);
    });

    it('loadingContainer is centred', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.loadingContainer.justifyContent).toBe('center');
        expect(result.loadingContainer.alignItems).toBe('center');
    });

    it('container has paddingTop of 12', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.container.paddingTop).toBe(12);
    });

    it('container has paddingBottom of 24', () => {
        const result = styles(DefaultColours, baseAccessibility);
        expect(result.container.paddingBottom).toBe(24);
    });
});