/**
 * @format
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../src/screens/personal/ProfileScreen';
import ProfileService from '../src/logic/ProfileService';
import { ThemeContext } from '../src/theme/colourController';
import { DefaultColours } from '../src/theme/colours';

// Mock ProfileService
jest.mock('../src/logic/ProfileService');

describe('ProfileScreen', () => {
  const mockProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '0123456789',
    hasPinCode: true,
    created: '2023-01-01',
  };

  const mockTheme = DefaultColours;

  const mockUpdateTheme = jest.fn();

  const renderScreen = () =>
    render(
      <ThemeContext.Provider
        value={{ theme: mockTheme, updateTheme: mockUpdateTheme }}
      >
        <ProfileScreen />
      </ThemeContext.Provider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('shows error message if profile fails to load', async () => {
    (ProfileService.getProfile as jest.Mock).mockRejectedValue(
      new Error('Failed'),
    );

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Error loading profile')).toBeTruthy();
    });
  });

  it('renders the edit button and can press it', async () => {
    (ProfileService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Edit Profile')).toBeTruthy();
    });

    fireEvent.press(getByText('Edit Profile'));
    // No navigation is hooked, just ensure press works without crashing
  });
});
