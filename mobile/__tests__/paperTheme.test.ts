import { paperTheme } from '../src/theme/paperTheme';

const mockThemeContext = {
  theme: {
    redPrimary: '#FF0000',
    greyPrimaryMainText: '#333333',
    greyIconLight: '#AAAAAA',
    greyBackground: '#F5F5F5',
  },
  accessibility: {
  },
} as any;

describe('paperTheme', () => {
  const result = paperTheme(mockThemeContext);

  it('returns base MD3 properties', () => {
    expect(result.dark).toBe(false);
    expect(result.version).toBe(3);
    expect(result.mode).toBe('exact');
    expect(result.roundness).toBe(1.8);
    expect(result.animation).toEqual({ scale: 1.0 });
  });
});