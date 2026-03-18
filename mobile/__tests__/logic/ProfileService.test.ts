import ProfileService from '../../src/logic/ProfileService';
import AuthenticationService from '../../src/logic/AuthenticationService';
import { ProfileModel } from '../../src/model/response/ProfileModel';

jest.mock('../../src/logic/AuthenticationService');

describe('ProfileService', () => {
  const mockProfile: ProfileModel = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '1234567890',
    created: '2026-03-18T12:00:00Z',
  };

  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    fetchMock = AuthenticationService.fetch as jest.Mock;
  });

  it('getProfile - should fetch and return user profile successfully', async () => {
    // Mock fetch to return a Response-like object with json() method
    fetchMock.mockResolvedValue({
      json: async () => mockProfile,
    });

    const profile = await ProfileService.getProfile();

    expect(fetchMock).toHaveBeenCalledWith('/profile/me', { method: 'GET' });
    expect(profile).toEqual(mockProfile);
  });

  it('getProfile - should throw error when fetch fails', async () => {
    const error = new Error('Network error');

    fetchMock.mockRejectedValue(error);

    await expect(ProfileService.getProfile()).rejects.toThrow('Network error');
    expect(fetchMock).toHaveBeenCalledWith('/profile/me', { method: 'GET' });
  });

  it('getProfile - should log error when fetch fails', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('Fetch failed');

    fetchMock.mockRejectedValue(error);

    await expect(ProfileService.getProfile()).rejects.toThrow('Fetch failed');
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching profile:', error);

    consoleSpy.mockRestore();
  });
});
