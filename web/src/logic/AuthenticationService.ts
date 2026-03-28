import { HttpException } from "../models/HttpException.ts";
import { AppSettings } from "../AppSettings.ts";
import type { AuthType } from "../models/AuthType.ts";

export class AuthenticationService {
    auth: AuthType

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
        // Add the Authorisation header with the access token to the request options
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${this.auth.accessToken}`,
        }

        const response = await fetch(url, options)

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

            this.auth.setAccessToken(data.accessToken);
        } else {
            throw new HttpException(response.status, response.statusText);
        }
    }

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

            this.auth.setAccessToken(data.accessToken);
            this.auth.setIsAuthenticated(true);
            this.auth.setIsMfaAuthenticated(false);
        }
        else {
            throw new HttpException(response.status, response.statusText);
        }
    }
}