import AuthenticationService from './AuthenticationService';
import { HttpException } from '../exception/HttpException';

export interface ProfileModel {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  created: string;
}

class ProfileService {
  static async getProfile(): Promise<ProfileModel> {
    const response = await AuthenticationService.fetch('/profile/me', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new HttpException(response.status, 'Failed to fetch profile');
    }

    return await response.json();
  }
}

export default ProfileService;
