import { getSettings, updateSettings } from '../../src/logic/SettingsService';
import AuthenticationService from '../../src/logic/AuthenticationService';

jest.mock('../../src/logic/AuthenticationService');

describe('SettingsService', () => {

  const mockSettings = {
    largeText: false,
    dyslexicFont: false,
    highlightText: false,
    themePreset: 'DEFAULT',
    accentColour: '#D20414',
    textColour: '#000000',
    backgroundColour: '#F6F6F8',
    silentStart: null,
    silentEnd: null,
  };

  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = AuthenticationService.fetch as jest.Mock;
  });

  // getSettings

  it('getSettings - should fetch and return settings successfully', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockSettings,
    });

    const result = await getSettings();

    expect(fetchMock).toHaveBeenCalledWith('/api/settings', { method: 'GET' });
    expect(result).toEqual(mockSettings);
  });

  it('getSettings - should throw error when response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    });

    await expect(getSettings()).rejects.toThrow('Failed to fetch settings');
    expect(fetchMock).toHaveBeenCalledWith('/api/settings', { method: 'GET' });
  });

  it('getSettings - should throw error when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    await expect(getSettings()).rejects.toThrow('Network error');
    expect(fetchMock).toHaveBeenCalledWith('/api/settings', { method: 'GET' });
  });

  // updateSettings

  it('updateSettings - should send settings and resolve successfully', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
    });

    await expect(updateSettings(mockSettings)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockSettings),
    });
  });

  it('updateSettings - should throw error when response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    });

    await expect(updateSettings(mockSettings)).rejects.toThrow('Failed to update settings');
    expect(fetchMock).toHaveBeenCalledWith('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockSettings),
    });
  });

  it('updateSettings - should throw error when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    await expect(updateSettings(mockSettings)).rejects.toThrow('Network error');
  });

  it('updateSettings - should correctly serialise partial settings', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
    });

    const partialUpdate = { themePreset: 'DARK', accentColour: '#000000' };

    await updateSettings(partialUpdate);

    expect(fetchMock).toHaveBeenCalledWith('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partialUpdate),
    });
  });

  it('updateSettings - should correctly serialise null themePreset for custom mode', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
    });

    const customUpdate = { themePreset: null, accentColour: '#FF0000' };

    await updateSettings(customUpdate);

    expect(fetchMock).toHaveBeenCalledWith('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customUpdate),
    });
  });
});