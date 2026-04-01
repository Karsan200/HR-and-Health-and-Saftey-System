/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditProfileScreen from '../src/screens/personal/EditProfileScreen';
import ProfileService from '../src/logic/ProfileService';
import { ThemeContext } from '../src/theme/colourController';
import { DefaultColours } from '../src/theme/colours';

jest.mock('react-native-wheel-color-picker', () => () => null);
jest.mock('../src/logic/ProfileService');

describe('EditProfileScreen', () => {
  const mockTheme = DefaultColours;

  const renderScreen = () =>
    render(
      <ThemeContext.Provider
        value={{
          theme: mockTheme,
          updateTheme: jest.fn(),
          accessibility: { largeText: false, dyslexicFont: false } as any,
          updateAccessibility: jest.fn(),
        }}
      >
        <EditProfileScreen />
      </ThemeContext.Provider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  // Rendering

  it('renders all section titles', () => {
    const { getByText } = renderScreen();
    expect(getByText('Personal')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('renders all field labels', () => {
    const { getByText } = renderScreen();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Phone')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
    expect(getByText('Old Password')).toBeTruthy();
    expect(getByText('New Password')).toBeTruthy();
    expect(getByText('Confirm New Password')).toBeTruthy();
  });

  it('renders the save button', () => {
    const { getByText } = renderScreen();
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('renders all placeholder texts', () => {
    const { getByPlaceholderText } = renderScreen();
    expect(getByPlaceholderText('New Email')).toBeTruthy();
    expect(getByPlaceholderText('New Phone Number')).toBeTruthy();
    expect(getByPlaceholderText('New Username')).toBeTruthy();
    expect(getByPlaceholderText('Required to change password')).toBeTruthy();
    expect(getByPlaceholderText('Min. 8 characters')).toBeTruthy();
    expect(getByPlaceholderText('Re-enter new password')).toBeTruthy();
  });

  // Input interaction

  it('updates email field when typed into', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('New Email');
    fireEvent.changeText(input, 'new@example.com');
    expect(input.props.value).toBe('new@example.com');
  });

  it('updates phone field when typed into', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('New Phone Number');
    fireEvent.changeText(input, '07700900000');
    expect(input.props.value).toBe('07700900000');
  });

  it('updates username field when typed into', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('New Username');
    fireEvent.changeText(input, 'newuser');
    expect(input.props.value).toBe('newuser');
  });

  it('updates old password field when typed into', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('Required to change password');
    fireEvent.changeText(input, 'oldpass123');
    expect(input.props.value).toBe('oldpass123');
  });

  it('updates new password field when typed into', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('Min. 8 characters');
    fireEvent.changeText(input, 'newpass456');
    expect(input.props.value).toBe('newpass456');
  });

  it('updates confirm password field when typed into', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('Re-enter new password');
    fireEvent.changeText(input, 'newpass456');
    expect(input.props.value).toBe('newpass456');
  });

  // Validation, email

  it('shows email validation error for invalid email', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(getByPlaceholderText('New Email'), 'notanemail');
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('clears email error when user corrects the field', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderScreen();
    fireEvent.changeText(getByPlaceholderText('New Email'), 'notanemail');
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() =>
      expect(getByText('Please enter a valid email address')).toBeTruthy(),
    );
    fireEvent.changeText(
      getByPlaceholderText('New Email'),
      'fixed@example.com',
    );
    await waitFor(() =>
      expect(queryByText('Please enter a valid email address')).toBeNull(),
    );
  });

  // Validation, phone bumber

  it('shows phone validation error for invalid phone number', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(getByPlaceholderText('New Phone Number'), 'abc');
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(getByText('Please enter a valid phone number')).toBeTruthy();
    });
  });

  it('clears phone error when user corrects the field', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderScreen();
    fireEvent.changeText(getByPlaceholderText('New Phone Number'), 'abc');
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() =>
      expect(getByText('Please enter a valid phone number')).toBeTruthy(),
    );
    fireEvent.changeText(
      getByPlaceholderText('New Phone Number'),
      '07700900000',
    );
    await waitFor(() =>
      expect(queryByText('Please enter a valid phone number')).toBeNull(),
    );
  });

  // Validation, username

  it('shows username validation error when username is too short', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(getByPlaceholderText('New Username'), 'ab');
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(getByText('Username must be at least 3 characters')).toBeTruthy();
    });
  });

  it('clears username error when user corrects the field', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderScreen();
    fireEvent.changeText(getByPlaceholderText('New Username'), 'ab');
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() =>
      expect(getByText('Username must be at least 3 characters')).toBeTruthy(),
    );
    fireEvent.changeText(getByPlaceholderText('New Username'), 'validuser');
    await waitFor(() =>
      expect(queryByText('Username must be at least 3 characters')).toBeNull(),
    );
  });

  // Validation, password

  it('shows error when new password is entered without old password', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'newpass456',
    );
    fireEvent.changeText(
      getByPlaceholderText('Re-enter new password'),
      'newpass456',
    );
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(getByText('Please enter your current password')).toBeTruthy();
    });
  });

  it('shows error when old password entered without new password', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(
      getByPlaceholderText('Required to change password'),
      'oldpass123',
    );
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(getByText('Please enter a new password')).toBeTruthy();
    });
  });

  it('shows error when new password is too short', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(
      getByPlaceholderText('Required to change password'),
      'oldpass123',
    );
    fireEvent.changeText(getByPlaceholderText('Min. 8 characters'), 'short');
    fireEvent.changeText(
      getByPlaceholderText('Re-enter new password'),
      'short',
    );
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(
        getByText('New password must be at least 8 characters'),
      ).toBeTruthy();
    });
  });

  it('shows error when confirm password is missing', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(
      getByPlaceholderText('Required to change password'),
      'oldpass123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'newpass456',
    );
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(getByText('Please confirm your new password')).toBeTruthy();
    });
  });

  it('shows error when passwords do not match', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(
      getByPlaceholderText('Required to change password'),
      'oldpass123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'newpass456',
    );
    fireEvent.changeText(
      getByPlaceholderText('Re-enter new password'),
      'different1',
    );
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });

  it('clears password errors when user corrects the fields', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderScreen();
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'newpass456',
    );
    fireEvent.press(getByText('Save Changes'));
    await waitFor(() =>
      expect(getByText('Please enter your current password')).toBeTruthy(),
    );
    fireEvent.changeText(
      getByPlaceholderText('Required to change password'),
      'oldpass123',
    );
    await waitFor(() =>
      expect(queryByText('Please enter your current password')).toBeNull(),
    );
  });

  // Save, success

  it('calls ProfileService.updateProfile with correct payload on valid save', async () => {
    (ProfileService.updateProfile as jest.Mock).mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('New Email'), 'new@example.com');
    fireEvent.changeText(
      getByPlaceholderText('New Phone Number'),
      '07700900000',
    );

    await act(async () => {
      fireEvent.press(getByText('Save Changes'));
    });

    expect(ProfileService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        phoneNumber: '07700900000',
      }),
    );
  });

  it('shows success alert after a successful save', async () => {
    (ProfileService.updateProfile as jest.Mock).mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('New Email'), 'new@example.com');

    await act(async () => {
      fireEvent.press(getByText('Save Changes'));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Success',
      'Your profile has been updated.',
    );
  });

  it('clears password fields after a successful save', async () => {
    (ProfileService.updateProfile as jest.Mock).mockResolvedValue(undefined);
    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(
      getByPlaceholderText('Required to change password'),
      'oldpass123',
    );
    fireEvent.changeText(
      getByPlaceholderText('Min. 8 characters'),
      'newpass456',
    );
    fireEvent.changeText(
      getByPlaceholderText('Re-enter new password'),
      'newpass456',
    );

    await act(async () => {
      fireEvent.press(getByText('Save Changes'));
    });

    expect(
      getByPlaceholderText('Required to change password').props.value,
    ).toBe('');
    expect(getByPlaceholderText('Min. 8 characters').props.value).toBe('');
    expect(getByPlaceholderText('Re-enter new password').props.value).toBe('');
  });

  // Save, failure

  it('shows failure alert with server message when update fails', async () => {
    (ProfileService.updateProfile as jest.Mock).mockRejectedValue(
      new Error('Current password is incorrect'),
    );
    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('New Email'), 'new@example.com');

    await act(async () => {
      fireEvent.press(getByText('Save Changes'));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Update failed',
      'Current password is incorrect',
    );
  });

  it('shows generic failure message when error has no message', async () => {
    (ProfileService.updateProfile as jest.Mock).mockRejectedValue({});
    const { getByPlaceholderText, getByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('New Email'), 'new@example.com');

    await act(async () => {
      fireEvent.press(getByText('Save Changes'));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Update failed',
      'Something went wrong. Please try again.',
    );
  });

  // Save, does not call service when validation fails

  it('does not call ProfileService when validation errors exist', async () => {
    const { getByPlaceholderText, getByText } = renderScreen();
    fireEvent.changeText(getByPlaceholderText('New Email'), 'notanemail');
    fireEvent.press(getByText('Save Changes'));

    await waitFor(() =>
      expect(getByText('Please enter a valid email address')).toBeTruthy(),
    );

    expect(ProfileService.updateProfile).not.toHaveBeenCalled();
  });
});
