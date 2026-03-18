import AuthenticationService from "./AuthenticationService";

export async function getSettings() {
    const response = await AuthenticationService.fetch("/settings", {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch settings");
    }

    return await response.json();
}

export async function updateSettings(settings: any) {
    const response = await AuthenticationService.fetch("/settings", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
    });

    if (!response.ok) {
        throw new Error("Failed to update settings");
    }
}