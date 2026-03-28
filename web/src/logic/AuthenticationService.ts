import { type AuthContextType } from "../AuthContext.tsx";
import { HttpException } from "../models/HttpException.ts";
import { AppSettings } from "../AppSettings.ts";

export class AuthenticationService {
    auth: AuthContextType

    constructor(auth: AuthContextType) {
        this.auth = auth;
    }

    async login(username: string, password: string) {
        const response = await fetch(AppSettings.API_URL + "/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
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