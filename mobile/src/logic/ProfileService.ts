import AuthenticationService from './AuthenticationService';
import { ProfileModel } from '../model/response/ProfileModel';

class ProfileService {
  /**
   * Fetches the profile of the currently authenticated user.
   *
   * @returns User's profile data
   * @throws HttpException if the request fails or the user is unauthorized
   */
  static async getProfile(): Promise<ProfileModel> {
    try {
      const response = await AuthenticationService.fetch('/profile/me', {
        method: 'GET',
      });

      return await response.json();
    } catch (error) {

      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}

export default ProfileService;
