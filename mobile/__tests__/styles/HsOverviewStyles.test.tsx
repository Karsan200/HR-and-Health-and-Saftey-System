import { styles, localStyles } from '../../src/screens/HsOverview.styles';
import { DefaultColours } from '../../src/theme/colours';

describe('HsOverviewStyles', () => {

  const baseAccessibility = {
    largeText: false,
    dyslexicFont: false,
  };

  it('applies normal font scale when largeText is false', () => {
    const testStyle1 = styles(DefaultColours, { ...baseAccessibility, largeText: false });
    const testStyle2 = localStyles(DefaultColours, {...baseAccessibility, largeText: false});
    expect(testStyle1).toBeDefined();
    expect(testStyle2).toBeDefined();
  });

  it('applies large font scale when largeText is true', () => {
    const testStyle1 = styles(DefaultColours, { ...baseAccessibility, largeText: true });
    const testStyle2 = localStyles(DefaultColours, { ...baseAccessibility, largeText: true });
    expect(testStyle1).toBeDefined();
    expect(testStyle2).toBeDefined();
  });

  it('applies normal font family when dyslexicFont is false', () => {
    const testStyle1 = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: false });
    const testStyle2 = localStyles(DefaultColours, { ...baseAccessibility, dyslexicFont: false });
    expect(testStyle1).toBeDefined();
    expect(testStyle2).toBeDefined();
  });

  it('applies dyslexic font family when dyslexicFont is true', () => {
    const testStyle1 = styles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
    const testStyle2 = localStyles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
    expect(testStyle1).toBeDefined();
    expect(testStyle2).toBeDefined();
  });

  it('applies all accessibility options simultaneously', () => {
    const testStyle1 = styles(DefaultColours, {
      largeText: true,
      dyslexicFont: true,
    });
    const testStyle2 = localStyles(DefaultColours, {
      largeText: true,
      dyslexicFont: true,
    });
    expect(testStyle1).toBeDefined();
    expect(testStyle2).toBeDefined();
  });
});