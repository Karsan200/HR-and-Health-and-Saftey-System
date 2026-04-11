import type { AuthenticationService } from "./AuthenticationService";

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export async function changePassword(
    authenticationService: AuthenticationService,
    request: ChangePasswordRequest
): Promise<void> {
    const response = await authenticationService.fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to change password");
    }
}