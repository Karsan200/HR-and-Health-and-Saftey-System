import { AuthRequestModel } from '../model/request/AuthRequestModel.ts';
import { AppSettings } from '../AppSettings.ts';
import { HttpException } from '../exception/HttpException.ts';

class AuthenticationService {
    static async fetch(url: string, options: RequestInit): Promise<Response> {
        return await fetch(url, options);
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

        //TODO: Store the tokens in react native keychain
    }
}

export default AuthenticationService;