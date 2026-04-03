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
    range: string = "last-month"
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

export type DocumentSignaturesResponse = {
    signed: number;
    pending: number;
};

export async function getDocumentSignatures(
    authenticationService: AuthenticationService,
    range: string = "this-month"
): Promise<DocumentSignaturesResponse> {
    const response = await authenticationService.fetch(
        `/api/admin/document-signatures?range=${range}`,
        { method: "GET" }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch document signatures");
    }

    return response.json();
}

export type HazardsReportedPoint = {
    label: string;
    value: number;
};

export type HazardsReportedResponse = {
    range: string;
    total: number;
    points: HazardsReportedPoint[];
};

export async function getHazardsReported(
    authenticationService: AuthenticationService,
    range: string = "this-month"
): Promise<HazardsReportedResponse> {
    const response = await authenticationService.fetch(
        `/api/admin/hazards-reported?range=${range}`,
        { method: "GET" }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch hazards reported");
    }

    return response.json();
}
