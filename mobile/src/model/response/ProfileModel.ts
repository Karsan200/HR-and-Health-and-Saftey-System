/**
 * Structure of a user profile returned from the backend for profile page.
 */
export interface ProfileModel {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  hasPinCode: boolean;
  created: string;
}
