import { AppSettings } from '../src/AppSettings.ts';

describe('AppSettings', () => {
  it('should export AppSettings object', () => {
    expect(AppSettings).toBeDefined();
    expect(typeof AppSettings).toBe('object');
  });

  describe('API_URL', () => {
    it('should have API_URL defined', () => {
      expect(AppSettings.API_URL).toBeDefined();
    });

    it('should be a valid URL string', () => {
      expect(typeof AppSettings.API_URL).toBe('string');
      expect(AppSettings.API_URL.length).toBeGreaterThan(0);
    });
  });

  describe('CDN_URL', () => {
    it('should have CDN_URL defined', () => {
      expect(AppSettings.CDN_URL).toBeDefined();
    });

    it('should be a valid URL string', () => {
      expect(typeof AppSettings.CDN_URL).toBe('string');
      expect(AppSettings.CDN_URL.length).toBeGreaterThan(0);
    });
  });

  describe('configuration structure', () => {
    it('should only contain expected properties', () => {
      const expectedKeys = ['API_URL', 'CDN_URL', 'BLE_SERVICE_UUID'];
      const actualKeys = Object.keys(AppSettings);
      expect(actualKeys).toEqual(expectedKeys);
    });
  });
});
