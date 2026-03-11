import * as Keychain from 'react-native-keychain';

import AuthenticationService from '../../src/logic/AuthenticationService';
import { AppSettings } from "../../src/AppSettings.ts";

jest.mock('react-native-keychain');

describe('AuthenticationService - Credential Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup the mock to resolve successfully
    (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'authTokens',
      password: JSON.stringify({ accessToken: 'testAccessToken', refreshToken: 'testRefreshToken' }),
    });
  });

  it('putCredentials - Test credentials are set successfully', async () => {
    const accessToken = 'testAccessToken';
    const refreshToken = 'testRefreshToken';

    // Call the method to store credentials
    await AuthenticationService.putCredentials(accessToken, refreshToken);

    // Verify that setGenericPassword was called with the correct parameters
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'authTokens',
        JSON.stringify({ accessToken, refreshToken })
    );
  });

  it('getCredentials - Test credentials are retrieved successfully', async () => {
    // Call the method to retrieve credentials
    const credentials = await AuthenticationService.getCredentials();

    // Verify that getGenericPassword was called
    expect(Keychain.getGenericPassword).toHaveBeenCalled();

    // Verify that the retrieved credentials match the expected values
    expect(credentials).toEqual({
        accessToken: 'testAccessToken',
        refreshToken: 'testRefreshToken',
    });
  });
});

describe('refresh - Access token refreshing', () => {
    let getCredentialsSpy: jest.SpyInstance;
    let putCredentialsSpy: jest.SpyInstance;
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on getCredentials to return valid tokens
        getCredentialsSpy = jest.spyOn(AuthenticationService, 'getCredentials').mockResolvedValue({
            accessToken: 'oldAccessToken',
            refreshToken: 'oldRefreshToken',
        });
        // Spy on putCredentials to resolve successfully
        putCredentialsSpy = jest.spyOn(AuthenticationService, 'putCredentials').mockResolvedValue(undefined);
        // Spy on fetch method
        fetchSpy = jest.spyOn(AuthenticationService, 'fetch');
    });

    afterEach(() => {
        getCredentialsSpy.mockRestore();
        putCredentialsSpy.mockRestore();
        fetchSpy.mockRestore();
    });

    it('Should return HttpException 401 due to getCredentials returning null', async () => {
        // Mock getCredentials to return null to simulate missing credentials
        getCredentialsSpy.mockResolvedValue(null);

        await expect(AuthenticationService.refresh()).rejects.toMatchObject({
            statusCode: 401,
            message: 'No authentication tokens found.',
        });
    });

    it('Should return HttpException 401 due to failed token refresh', async () => {
        // Mock the fetch method to return a failed response
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 401,
        });

        await expect(AuthenticationService.refresh()).rejects.toMatchObject({
            statusCode: 401,
            message: 'Failed to refresh access token.',
        });
    });

    it('Should refresh access token successfully', async () => {
        // Mock the fetch method to return a successful response with a new access token
        fetchSpy.mockResolvedValue({
            ok: true,
            json: async () => ({ accessToken: 'newAccessToken' }),
        });

        await AuthenticationService.refresh();

        // Verify that getCredentials was called to retrieve existing tokens
        expect(getCredentialsSpy).toHaveBeenCalled();

        // Verify that fetch was called with the correct parameters
        expect(fetchSpy).toHaveBeenCalledWith(AppSettings.API_URL + "/auth/refresh", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'refreshToken=oldRefreshToken',
            },
        });

        // Verify that putCredentials was called to store the new access token
        expect(putCredentialsSpy).toHaveBeenCalledWith('newAccessToken', 'oldRefreshToken');
    });
})