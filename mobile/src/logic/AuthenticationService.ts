import * as Keychain from 'react-native-keychain';
import { jwtDecode } from 'jwt-decode';

import { AppSettings } from '../AppSettings.ts';
import { HttpException } from '../exception/HttpException.ts';
import { TokenResponseModel } from "../model/response/TokenResponseModel.ts";
import { AuthRequestModel } from '../model/request/AuthRequestModel.ts';
import { JwTClaimsModel } from '../model/JwTClaimsModel.ts';

/**
 * Service class responsible for handling user authentication operations such as login.
 * It provides methods to perform API requests related to authentication and manages tokens.
 */
class AuthenticationService {
    /**
     * Helper method to perform fetch requests, handling authorisation headers for JWT tokens
     * @param url - The endpoint URL to send the request to
     * @param options - RequestInit options for the fetch request, including method, headers, body, etc.
     * @param hasRefreshed - Internal flag to prevent infinite refresh loops, should not be set by external callers
     * @returns Promise that resolves to the Response object from the fetch request
     */
    static async fetch(url: string, options: RequestInit = {}, hasRefreshed: boolean = false): Promise<Response> {
      // Get the access token from the keychain
      const credentials = await this.getCredentials();
      const accessToken = credentials?.accessToken;

      // If an access token does not exist, throw an error indicating that the user is not authenticated
      if (!accessToken) {
        throw new HttpException(401, 'No authentication tokens found.');
      }

      // Add the Authorization header with the access token to the request options
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      }

      const response = await fetch(AppSettings.API_URL + url, options);

      // Try to refresh the access token if the response indicates an unauthorized error
      if (response.status === 401 && !hasRefreshed) {
        await this.refresh();
        return await this.fetch(url, options, true)
      }
      // If the response is still unauthorized after attempting to refresh, throw an error indicating the refresh token is invalid
      else if (response.status === 401 && hasRefreshed) {
        throw new HttpException(401, 'Invalid refresh token.');
      }

      return response;
    }

  /**
   * Extracts and returns the JWT claims from the access token stored in the keychain.
   * @returns Promise that resolves to an object containing the JWT claims (accountId, issuedAt, expiresAt) if the access token is valid, otherwise throws an error
   * @throws HttpException with appropriate status code and message for different failure scenarios such as missing tokens or invalid JWT format
   */
  static async extractClaims(): Promise<JwTClaimsModel> {
        const credentials = await this.getCredentials();

        if (!credentials) {
            throw new HttpException(401, 'No authentication tokens found.');
        }

        const accessToken = credentials.accessToken;

        try {
            const claims: any = jwtDecode(accessToken);
            return {
              accountId: parseInt(claims.sub, 10),
              issuedAt: claims.iat,
              expiresAt: claims.exp,
            }
        } catch (error) {
            console.error('Error extracting JWT claims:', error);
            throw new HttpException(500, 'Failed to extract JWT claims.');
        }
    }

    /**
     * Refreshes the access token using the refresh token stored in the keychain.
     * @returns Promise that resolves when the access token is successfully refreshed and stored, otherwise throws an error
     * @throws HttpException with appropriate status code and message for different failure scenarios during token refresh
     */
    static async refresh(): Promise<void> {
        const credentials = await this.getCredentials();
        if (credentials === null) {
            throw new HttpException(401, 'No authentication tokens found.');
        }

        const response = await fetch(AppSettings.API_URL + "/auth/refresh", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `refreshToken=${credentials.refreshToken}`,
            }
        });

        if (!response.ok) {
            throw new HttpException(401, 'Failed to refresh access token.');
        }
        else {
            const data: TokenResponseModel = await response.json();

            const accessToken: string = data.accessToken;

            // Store the new access token securely in the keychain, keeping the same refresh token
            await this.putCredentials(accessToken, credentials.refreshToken);
        }
    }

    /**
     * Stores the access token and refresh token securely in the keychain.
     * @param accessToken - The JWT access token to be stored
     * @param refreshToken - The refresh token to be stored
     * @returns Promise that resolves when the tokens are successfully stored
     * @throws HttpException with appropriate status code and message if storing credentials in keychain fails
     */
    static async putCredentials(accessToken: string, refreshToken: string): Promise<void> {
        try {
            await Keychain.setGenericPassword('authTokens', JSON.stringify({ accessToken, refreshToken }));
        } catch (error) {
            console.error('Error storing credentials in keychain:', error);
            throw new HttpException(500, 'Failed to store authentication tokens securely.');
        }
    }

    /**
     * Retrieves the access token and refresh token from the keychain.
     * @return Promise that resolves to an object containing the access token and refresh token if they exist, otherwise null. Throws an error if retrieval fails.
     * @throws HttpException with appropriate status code and message if retrieval from keychain fails
     */
    static async getCredentials(): Promise<{ accessToken: string; refreshToken: string } | null> {
        try {
            const credentials = await Keychain.getGenericPassword();
            if (credentials) {
                const { accessToken, refreshToken } = JSON.parse(credentials.password);
                return { accessToken, refreshToken };
            }
            return null;
        }
        catch (error) {
            console.error('Error retrieving credentials from keychain:', error);
            throw new HttpException(500, 'Failed to retrieve authentication tokens securely.');
        }
    }

    /**
    * Login user with provided credentials
    * @param body - Object containing username, password and isMobile flag
    * @returns Promise that resolves if login is successful, otherwise throws an error
    * @throws HttpException with appropriate status code and message for different failure scenarios
    */
    static async login(body: AuthRequestModel): Promise<void> {
        const response = await this.fetch(AppSettings.API_URL + "/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            switch (response.status) {
              case 401:
                throw new HttpException(
                  401,
                  'Invalid username or password'
                );
              case 404:
                throw new HttpException(
                  404,
                  'No user exists with the provided username'
                );
              default:
                throw new HttpException(
                  response.status,
                  'Unknown or internal server error occurred.'
                );
            }
        }

        // Get the access token from the response
        const data = await response.json();
        const accessToken: string = data.accessToken;

        // Get the refresh token from the cookies
        const cookies: string | null = response.headers.get('set-cookie');

        if (cookies == null) {
            throw new HttpException(
                500,
                'Failed to retrieve refresh token from response cookies.'
            );
        }

        // Extract the refresh token from the cookies string
        const refreshTokenMatch = cookies.match(/refreshToken=([^;]+)/);
        if (!refreshTokenMatch) {
            throw new HttpException(
                500,
                'Failed to parse refresh token from response cookies.'
            );
        }
        const refreshToken: string = refreshTokenMatch[1];

        // Store the access token and refresh token securely in the keychain
        await this.putCredentials(accessToken, refreshToken);
    }
}

export default AuthenticationService;