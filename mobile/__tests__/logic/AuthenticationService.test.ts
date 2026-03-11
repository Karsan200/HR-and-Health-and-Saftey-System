import * as Keychain from 'react-native-keychain';

import AuthenticationService from '../../src/logic/AuthenticationService';
import { AppSettings } from "../../src/AppSettings.ts";

declare const global: any;
global.fetch = jest.fn();

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

describe('AuthenticationService - refresh & extracting claims', () => {
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
        fetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
        getCredentialsSpy.mockRestore();
        putCredentialsSpy.mockRestore();
        fetchSpy.mockRestore();
    });

    it('refresh - Should return HttpException 401 due to getCredentials returning null', async () => {
        // Mock getCredentials to return null to simulate missing credentials
        getCredentialsSpy.mockResolvedValue(null);

        await expect(AuthenticationService.refresh()).rejects.toMatchObject({
            statusCode: 401,
            message: 'No authentication tokens found.',
        });
    });

    it('refresh - Should return HttpException 401 due to failed token refresh', async () => {
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

    it('refresh - Should refresh access token successfully', async () => {
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

    it('claims - Should return HttpException 401 due to getCredentials returning null', async () => {
        // Mock getCredentials to return null to simulate missing credentials
        getCredentialsSpy.mockResolvedValue(null);

        await expect(AuthenticationService.extractClaims()).rejects.toMatchObject({
            statusCode: 401,
            message: 'No authentication tokens found.',
        });
    });

    it('claims - Should extract claims successfully', async () => {
        // Mock getCredentials to return valid tokens
        getCredentialsSpy.mockResolvedValue({
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzk2MjJ9.3ETlmuYRQ4akrgES3ogapKRYY-Z2VeRDLfBECJNK8JQ",
            refreshToken: "testRefreshToken"
        });

        const claims = await AuthenticationService.extractClaims();

        // Verify that getCredentials was called to retrieve existing tokens
        expect(getCredentialsSpy).toHaveBeenCalled();

        // Verify that the extracted claims match the expected values
        expect(claims).toEqual({
            accountId: 2,
            issuedAt: 1516239022,
            expiresAt: 1516239622,
        });
    });
})

describe("AuthenticationService - fetch", () => {
    let getCredentialsSpy: jest.SpyInstance;
    let refreshSpy: jest.SpyInstance;
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on getCredentials to return valid tokens
        getCredentialsSpy = jest.spyOn(AuthenticationService, 'getCredentials').mockResolvedValue({
            accessToken: 'testAccessToken',
            refreshToken: 'testRefreshToken',
        });

        // Spy on refresh to resolve successfully
        refreshSpy = jest.spyOn(AuthenticationService, 'refresh').mockResolvedValue(undefined);

        // Spy on fetch method
        fetchSpy = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
        getCredentialsSpy.mockRestore();
        fetchSpy.mockRestore();
    });

    it ('fetch - Should return HttpException 401 due to getCredentials returning null', async () => {
        // Mock getCredentials to return null to simulate missing credentials
        getCredentialsSpy.mockResolvedValue(null);

        await expect(AuthenticationService.fetch('/api/data', { method: 'GET' })).rejects.toMatchObject({
            statusCode: 401,
            message: 'No authentication tokens found.',
        });
    });

    it('fetch - Expired access token, should refresh and then reveal the refresh token is invalid', async () => {
        // Mock fetch to first return a 401 for the initial request, then a 401 for the refresh attempt
        fetchSpy
            .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial request with expired token

        // Mock the refresh attempt to also fail with a 401, simulating an invalid refresh token
        refreshSpy.mockRejectedValueOnce({
            statusCode: 401,
            message: 'Failed to refresh access token.',
        });

        await expect(AuthenticationService.fetch('/api/data', { method: 'GET' })).rejects.toMatchObject({
            statusCode: 401,
            message: 'Failed to refresh access token.',
        });
    });

    it('fetch - Expired access token, should refresh and then succeed', async () => {
        // Mock fetch to first return a 401 for the initial request, then a successful response after refresh
        fetchSpy
            .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial request with expired token
            .mockResolvedValueOnce({ // Request after refresh
                ok: true,
                json: async () => ({ success: true }),
            });

        await expect(AuthenticationService.fetch('/api/data', { method: 'GET' })).resolves.toEqual({
            ok: true,
            json: expect.any(Function),
        });
    });

    it('fetch - Should return HttpException 401 if token refresh fails after initial 401', async () => {
        // Mock fetch to first return a 401 for the initial request, then a 401 for the refresh attempt
        fetchSpy
            .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial request with expired token
            .mockResolvedValueOnce({ ok: false, status: 401 }); // Refresh attempt fails

        await expect(AuthenticationService.fetch('/api/data', { method: 'GET' })).rejects.toMatchObject({
            statusCode: 401,
            message: 'Invalid refresh token.',
        });
    });

    it('fetch - Should include access token in Authorization header (successful)', async () => {
        // Mock the fetch method to return a successful response
        fetchSpy.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        const response = await AuthenticationService.fetch('/api/data', {
            method: 'GET',
        });

        // Verify that getCredentials was called to retrieve existing tokens
        expect(getCredentialsSpy).toHaveBeenCalled();

        // Verify that fetch was called with the correct parameters including the Authorization header
        expect(fetchSpy).toHaveBeenCalledWith(AppSettings.API_URL + '/api/data', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer testAccessToken',
            },
        });

        // Verify that the response is as expected
        expect(response).toEqual({
            ok: true,
            json: expect.any(Function),
        });
    });
});