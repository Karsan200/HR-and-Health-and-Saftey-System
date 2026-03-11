import React, { act } from 'react';
import AuthenticationService from '../src/logic/AuthenticationService.ts';
import PasswordAuthScreen from '../src/screens/auth/PasswordAuthScreen.tsx';
import { fireEvent, render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from '../src/theme/paperTheme.ts';

declare const global: any;
global.fetch = jest.fn();

describe('PasswordAuthScreen Form Functionality', () => {
  let getCredentialsSpy: jest.SpyInstance;
  let putCredentialsSpy: jest.SpyInstance;
  let fetchSpy: jest.SpyInstance;
  let mockSetIsAuthenticated: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetIsAuthenticated = jest.fn();
    // Spy on getCredentials to return valid tokens
    getCredentialsSpy = jest.spyOn(AuthenticationService, 'getCredentials').mockResolvedValue({
      accessToken: 'testAccessToken',
      refreshToken: 'testRefreshToken',
    });
    // Spy on putCredentials to resolve successfully
    putCredentialsSpy = jest.spyOn(AuthenticationService, 'putCredentials').mockResolvedValue(undefined);
    // Spy on fetch method
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    getCredentialsSpy.mockRestore();
    putCredentialsSpy.mockRestore();
    fetchSpy.mockRestore();
  });

  it('Empty form submission', async () => {
    const queries = render(
      <PaperProvider theme={paperTheme}>
        <PasswordAuthScreen isAuth={mockSetIsAuthenticated} />
      </PaperProvider>
    );

    await act(async () => {
      fireEvent.press(queries.getByText('Login'));
    });

    expect(queries.getByText('Error')).toBeTruthy();
    expect(queries.getByText('Please enter both a username and password')).toBeTruthy();
  });

  it('Incorrect credentials submission', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    const queries = render(
      <PaperProvider theme={paperTheme}>
        <PasswordAuthScreen isAuth={mockSetIsAuthenticated} />
      </PaperProvider>
    );

    const inputs = queries.getAllByTestId('text-input-outlined');

    await act(async () => {
      fireEvent.changeText(inputs[0], 'test');
      fireEvent.changeText(inputs[1], 'test');
    });

    await act(async () => {
      fireEvent.press(queries.getByText('Login'));
    });

    expect(queries.getByText('Error')).toBeTruthy();
    expect(queries.getByText('Invalid username or password entered')).toBeTruthy();
  });

  it('Username not found submission', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const queries = render(
      <PaperProvider theme={paperTheme}>
        <PasswordAuthScreen isAuth={mockSetIsAuthenticated} />
      </PaperProvider>
    );

    const inputs = queries.getAllByTestId('text-input-outlined');

    await act(async () => {
      fireEvent.changeText(inputs[0], 'test');
      fireEvent.changeText(inputs[1], 'test');
    });

    await act(async () => {
      fireEvent.press(queries.getByText('Login'));
    });

    expect(queries.getByText('Error')).toBeTruthy();
    expect(queries.getByText('No user exists with the provided username. Please check your username and try again.')).toBeTruthy();
  });

  it('Unknown error submission', async () => {
    fetchSpy.mockRejectedValueOnce({
      ok: false,
      status: 501
    });

    const queries = render(
      <PaperProvider theme={paperTheme}>
        <PasswordAuthScreen isAuth={mockSetIsAuthenticated} />
      </PaperProvider>
    );

    const inputs = queries.getAllByTestId('text-input-outlined');

    await act(async () => {
      fireEvent.changeText(inputs[0], 'test');
      fireEvent.changeText(inputs[1], 'test');
    });

    await act(async () => {
      fireEvent.press(queries.getByText('Login'));
    });

    expect(queries.getByText('Error')).toBeTruthy();
    expect(queries.getByText('An unknown error occurred during login. Please try again later.')).toBeTruthy();
  });

  it('Successful login submission', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: (name: string) => {
          if (name === 'set-cookie') return 'refreshToken=testRefreshToken; Path=/; HttpOnly';
          return null;
        }
      },
      json: async () => ({ accessToken: 'testAccessToken' })
    });

    const queries = render(
      <PaperProvider theme={paperTheme}>
        <PasswordAuthScreen isAuth={mockSetIsAuthenticated} />
      </PaperProvider>
    );

    const inputs = queries.getAllByTestId('text-input-outlined');

    await act(async () => {
      fireEvent.changeText(inputs[0], 'test');
      fireEvent.changeText(inputs[1], 'test');
    });

    await act(async () => {
      fireEvent.press(queries.getByText('Login'));
    });

    expect(AuthenticationService.putCredentials).toHaveBeenCalledWith('testAccessToken', 'testRefreshToken');
    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
  });
});