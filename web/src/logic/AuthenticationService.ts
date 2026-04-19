import { HttpException } from "../models/HttpException";
import { AppSettings } from "../AppSettings";
import type { AuthType } from "../models/AuthType";

/**
 * Service for handling authentication-related tasks, such as logging in, refreshing tokens, and making authenticated API requests.
 */
export class AuthenticationService {
    /** The authentication state and setters from the AuthContext, used to manage the authentication state of the application */
    auth: AuthType

    /**
     * Constructor for the AuthenticationService class.
     * @param auth The authentication state and setters from the AuthContext, used to manage the authentication state of the application
     */
    constructor(auth: AuthType) {
        this.auth = auth;
    }

    /**
     * Fetch wrapper that automatically adds the access token to the Authorisation header
     * and refreshes the token if it has expired.
     * @param url The URL to fetch
     * @param options The fetch options
     * @param hasRefreshed Whether the token has already been refreshed for this request (to prevent infinite loops)
     * @returns Promise The fetch response
     */
    async fetch(url: string, options: RequestInit = {}, hasRefreshed: boolean = false): Promise<Response> {
        const { headers, ...rest } = options;

        const response = await fetch(AppSettings.API_URL + url, {
            ...rest,
            headers: {
                ...headers,
                'Authorization': `Bearer ${this.auth.accessToken}`,
            }
        });

        // Refresh the token if the response was unauthorised
        if (response.status === 401 && !hasRefreshed) {
            await this.refresh();
            return this.fetch(url, options, true);
        }
        // If the response is still unauthorised after refreshing
        else if (response.status === 401 && hasRefreshed) {
            this.auth.setIsAuthenticated(false);
            this.auth.setIsMfaAuthenticated(false);
            this.auth.setAccessToken(null);
        }

        return response;
    }

    /**
     * Refreshes the access token by making a request to the refresh endpoint.
     * @throws HttpException if the refresh request fails, which will be caught in the AuthProvider to set the user as unauthenticated
     */
    async refresh() {
        const response = await fetch(AppSettings.API_URL + "/auth/refresh", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include' as RequestCredentials
        });

        if (response.ok) {
            const data = await response.json();

            this.auth.accessToken = data.accessToken;
            this.auth.setAccessToken(this.auth.accessToken);
        } else {
            throw new HttpException(response.status, response.statusText);
        }
    }

    /**
     * Authorises the user for MFA by sending the TOTP code to the server for verification.
     * @param code The TOTP code from the user's authenticator app
     */
    async mfaTotp(code: string) {
        const response = await this.fetch("/auth/mfa/authorise", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include' as RequestCredentials,
            body: JSON.stringify({
                code: code
            }),
        });

        if (response.ok) {
            const data = await response.json();

            this.auth.accessToken = data.accessToken;
            this.auth.setAccessToken(this.auth.accessToken);
            this.auth.setIsMfaAuthenticated(true);
        }
        else {
            throw new HttpException(response.status, response.statusText);
        }
    }

    /**
     * Logs in the user by sending their username and password to the server for authentication.
     * @param username The user's username
     * @param password The user's password
     */
    async login(username: string, password: string) {
        const response = await fetch(AppSettings.API_URL + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include' as RequestCredentials,
            body: JSON.stringify({
                username: username,
                password: password,
                isMobile: false
            }),
        });

        if (response.ok) {
            const data = await response.json();

            this.auth.accessToken = data.accessToken;
            this.auth.setAccessToken(this.auth.accessToken);
            this.auth.setIsAuthenticated(true);
            this.auth.setIsMfaAuthenticated(false);
        }
        else {
            throw new HttpException(response.status, response.statusText);
        }
    }

    static extractMfaCookie(): string | null {
        // Check the cookie for the MFA secret
        const cookies = document.cookie.split(";").reduce((acc: Record<string, string>, cookie) => {
            const eqIdx = cookie.indexOf("=");
            const key = cookie.slice(0, eqIdx).trim();
            const value = decodeURIComponent(cookie.slice(eqIdx + 1).trim());
            acc[key] = value;
            return acc;
        }, {});

        if (cookies.mfaSecret) {
            return cookies.mfaSecret
        }
        return null;
    }
}