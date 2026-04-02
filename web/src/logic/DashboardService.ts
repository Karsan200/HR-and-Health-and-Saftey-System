import { AuthenticationService } from "./AuthenticationService";

export async function getDashboardSummary(authenticationService: AuthenticationService) {
    const response = await authenticationService.fetch("/api/admin/summary", {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch dashboard summary");
    }

    return response.json();
}
