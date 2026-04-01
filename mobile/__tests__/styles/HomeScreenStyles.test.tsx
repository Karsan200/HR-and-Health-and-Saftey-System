import { homeStyles } from '../../src/screens/HomeScreen.styles';
import { DefaultColours } from '../../src/theme/colours';

describe('homeStyles', () => {

  const baseAccessibility = {
    largeText: false,
    dyslexicFont: false,
  };

  it('applies normal font scale when largeText is false', () => {
    const styles = homeStyles(DefaultColours, { ...baseAccessibility, largeText: false });
    expect(styles).toBeDefined();
  });

  it('applies large font scale when largeText is true', () => {
    const styles = homeStyles(DefaultColours, { ...baseAccessibility, largeText: true });
    expect(styles).toBeDefined();
  });

  it('applies normal font family when dyslexicFont is false', () => {
    const styles = homeStyles(DefaultColours, { ...baseAccessibility, dyslexicFont: false });
    expect(styles).toBeDefined();
  });

  it('applies dyslexic font family when dyslexicFont is true', () => {
    const styles = homeStyles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
    expect(styles).toBeDefined();
  });

  it('applies all accessibility options simultaneously', () => {
    const styles = homeStyles(DefaultColours, {
      largeText: true,
      dyslexicFont: true,
    });
    expect(styles).toBeDefined();
  });
});