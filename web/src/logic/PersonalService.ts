import type { AuthenticationService } from "./AuthenticationService";

export interface ProfileResponse {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phoneNumber: string;
    position: string;
    joinDate: string;
    silentStart: string | null;
    silentEnd: string | null;
    isAdmin: boolean;
    isManager: boolean;
}

export async function fetchProfile(authenticationService: AuthenticationService): Promise<ProfileResponse> {
    const response = await authenticationService.fetch("/api/profile", { method: "GET" });

    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }

    return response.json();
}