import AuthenticationService from './AuthenticationService';
import { ProfileModel } from '../model/response/ProfileModel';

export interface UpdateProfileRequest {
  email?: string;
  phoneNumber?: string;
  username?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

class ProfileService {
  /**
   * Fetches the profile of the currently authenticated user.
   *
   * @returns User's profile data
   * @throws HttpException if the request fails or the user is unauthorized
   */
  static async getProfile(): Promise<ProfileModel> {
    try {
      const response = await AuthenticationService.fetch('/api/profile/me', {
        method: 'GET',
      });

      return await response.json();
    } catch (error) {

      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Updates the currently authenticated user's profile.
   * Only fields with non-blank values are sent and empty fields are stripped
   * so unchanged values are not overwritten in the database.
   *
   * @param data Fields to update
   * @throws Error with the server's message if validation fails (400),
   *         or a generic message for other failures
   */
  static async updateProfile(data: UpdateProfileRequest): Promise<void> {
    // Strip blank fields before sending
    const payload: Partial<UpdateProfileRequest> = Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) => typeof v === 'string' && v.trim().length > 0,
      ),
    );

    const response = await AuthenticationService.fetch('/api/profile/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = 'Failed to update profile';
      try {
        const body = await response.json();
        if (body?.message) message = body.message;
      } catch {
      }
      throw new Error(message);
    }
  }
}

export default ProfileService;
