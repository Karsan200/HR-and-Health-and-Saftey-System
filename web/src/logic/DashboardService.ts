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

export type LateArrivalsPoint = {
    label: string;
    value: number;
};

export type LateArrivalsResponse = {
    range: string;
    total: number;
    points: LateArrivalsPoint[];
};

export async function getLateArrivals(
    authenticationService: AuthenticationService,
    range: string = "this-week"
): Promise<LateArrivalsResponse> {
    const response = await authenticationService.fetch(
        `/api/admin/late-arrivals?range=${range}`,
        { method: "GET" }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch late arrivals");
    }

    return response.json();
}
