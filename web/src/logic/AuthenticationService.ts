import { HttpException } from "../models/HttpException.ts";
import { AppSettings } from "../AppSettings.ts";
import type { AuthType } from "../models/AuthType.ts";

export class AuthenticationService {
    auth: AuthType

    constructor(auth: AuthType) {
        this.auth = auth;
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