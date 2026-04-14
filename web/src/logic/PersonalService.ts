import type { AuthenticationService } from "./AuthenticationService";

export interface ProfileResponse {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    created: string;
}

export interface SettingsResponse {
    silentStart: string | null;
    silentEnd: string | null;
}

export interface PersonalData {
    profile: ProfileResponse;
    settings: SettingsResponse;
}

export async function fetchProfileData(authenticationService: AuthenticationService): Promise<ProfileResponse> {
    const response = await authenticationService.fetch("/api/profile/me", { method: "GET" });

    if (!response.ok) {
        throw new Error("Failed to fetch profile");
    }

    return response.json();
}

async function fetchSettingsData(authenticationService: AuthenticationService): Promise<SettingsResponse> {
    const response = await authenticationService.fetch("/api/settings", { method: "GET" });

    if (!response.ok) {
        throw new Error("Failed to fetch settings");
    }

    return response.json();
}

// Fetches profile and settings in parallel and returns them together
export async function fetchPersonalData(authenticationService: AuthenticationService): Promise<PersonalData> {
    const [profile, settings] = await Promise.all([
        fetchProfileData(authenticationService),
        fetchSettingsData(authenticationService),
    ]);

    return { profile, settings };
}

export async function updateNotificationSettings(
    authenticationService: AuthenticationService,
    request: SettingsResponse
): Promise<void> {
    const response = await authenticationService.fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error("Failed to update notification settings");
    }
}