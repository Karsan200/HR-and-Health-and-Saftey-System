import ProfileService, {
  UpdateProfileRequest,
} from '../../src/logic/ProfileService';
import AuthenticationService from '../../src/logic/AuthenticationService';
import { ProfileModel } from '../../src/model/response/ProfileModel';

jest.mock('../../src/logic/AuthenticationService');

describe('ProfileService', () => {
  const mockProfile: ProfileModel = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '1234567890',
    hasPinCode: true,
    created: '2026-03-18T12:00:00Z',
  };

  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = AuthenticationService.fetch as jest.Mock;
  });

  // get profile

  describe('getProfile', () => {
    it('should fetch and return user profile successfully', async () => {
      fetchMock.mockResolvedValue({
        json: async () => mockProfile,
      });

      const profile = await ProfileService.getProfile();

    expect(fetchMock).toHaveBeenCalledWith('/api/profile/me', { method: 'GET' });
    expect(profile).toEqual(mockProfile);
  });

  it('getProfile - should throw error when fetch fails', async () => {
    const error = new Error('Network error');

    fetchMock.mockRejectedValue(error);

    await expect(ProfileService.getProfile()).rejects.toThrow('Network error');
    expect(fetchMock).toHaveBeenCalledWith('/api/profile/me', { method: 'GET' });
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

  // updateProfile tests

  describe('updateProfile', () => {
    it('should send only non-blank fields and resolve on 200', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      const data: UpdateProfileRequest = {
        email: 'new@example.com',
        phoneNumber: '07700900000',
      };

      await expect(ProfileService.updateProfile(data)).resolves.toBeUndefined();

      expect(fetchMock).toHaveBeenCalledWith('/api/profile/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new@example.com',
          phoneNumber: '07700900000',
        }),
      });
    });

    it('should strip blank and whitespace-only fields before sending', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      const data: UpdateProfileRequest = {
        email: 'new@example.com',
        phoneNumber: '   ',
        username: '',
      };

      await ProfileService.updateProfile(data);

      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(sentBody).toEqual({ email: 'new@example.com' });
      expect(sentBody).not.toHaveProperty('phoneNumber');
      expect(sentBody).not.toHaveProperty('username');
    });

    it('should strip undefined fields before sending', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      // Only email provided, rest are undefined
      await ProfileService.updateProfile({ email: 'test@example.com' });

      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(Object.keys(sentBody)).toEqual(['email']);
    });

    it('should throw generic error when response is not ok and body has no message', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        ProfileService.updateProfile({ email: 'new@example.com' }),
      ).rejects.toThrow('Failed to update profile');
    });

    it('should throw error with server message when response is not ok and body has message', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Current password is incorrect' }),
      });

      await expect(
        ProfileService.updateProfile({
          oldPassword: 'wrong',
          newPassword: 'newpass123',
          confirmNewPassword: 'newpass123',
        }),
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw generic error when response is not ok and body is not valid JSON', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      });

      await expect(
        ProfileService.updateProfile({ email: 'new@example.com' }),
      ).rejects.toThrow('Failed to update profile');
    });

    it('should send all password fields when all are provided', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      const data: UpdateProfileRequest = {
        oldPassword: 'oldpass123',
        newPassword: 'newpass456',
        confirmNewPassword: 'newpass456',
      };

      await ProfileService.updateProfile(data);

      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(sentBody).toEqual({
        oldPassword: 'oldpass123',
        newPassword: 'newpass456',
        confirmNewPassword: 'newpass456',
      });
    });

    it('should send an empty payload when all fields are blank', async () => {
      fetchMock.mockResolvedValue({ ok: true });

      await ProfileService.updateProfile({
        email: '',
        phoneNumber: '  ',
        username: '',
      });

      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(sentBody).toEqual({});
    });
  });
});
