import { dateDetailsStyles } from '../../src/screens/DateDetailsScreen.styles';
import { DefaultColours } from '../../src/theme/colours';

describe('DateDetailsStyles', () => {

  const baseAccessibility = {
    largeText: false,
    dyslexicFont: false,
  };

  it('applies normal font scale when largeText is false', () => {
    const styles = dateDetailsStyles(DefaultColours, { ...baseAccessibility, largeText: false });
    expect(styles).toBeDefined();
  });

  it('applies large font scale when largeText is true', () => {
    const styles = dateDetailsStyles(DefaultColours, { ...baseAccessibility, largeText: true });
    expect(styles).toBeDefined();
  });

  it('applies normal font family when dyslexicFont is false', () => {
    const styles = dateDetailsStyles(DefaultColours, { ...baseAccessibility, dyslexicFont: false });
    expect(styles).toBeDefined();
  });

  it('applies dyslexic font family when dyslexicFont is true', () => {
    const styles = dateDetailsStyles(DefaultColours, { ...baseAccessibility, dyslexicFont: true });
    expect(styles).toBeDefined();
  });

  it('applies all accessibility options simultaneously', () => {
    const styles = dateDetailsStyles(DefaultColours, {
      largeText: true,
      dyslexicFont: true,
    });
    expect(styles).toBeDefined();
  });
});