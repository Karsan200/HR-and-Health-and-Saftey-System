import type { AuthenticationService } from "./AuthenticationService";

/**
 * Represents a single pending document signature.
 * Contains the account (person who hasn't signed) and the document details.
 */
export interface PendingSignatureItem {
    accountId: number;
    fullName: string;
    documentId: number;
    documentTitle: string;
    sentDate: string;
}

// Fetches all pending document signatures.
export async function getPendingSignatures(
    authenticationService: AuthenticationService
): Promise<PendingSignatureItem[]> {
    const response = await authenticationService.fetch(
        "/api/documents/admin/pending-signatures",
        { method: "GET" }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch pending signatures: ${response.status}`);
    }

    return response.json();
}

/**
 * Represents a single risk assessment item in the list of all risk assessments.
 * Contains the id, title, hazard count, creation date and whether it has drafts.
 */
export interface RiskAssessmentItem {
    riskAssessmentId: number;
    title: string;
    hazardCount: number;
    created: string;
    hasDrafts: boolean;
}

export async function getRiskAssessments(
    authenticationService: AuthenticationService
): Promise<RiskAssessmentItem[]> {
    const response = await authenticationService.fetch(
        "/api/risk-assessment/all",
        { method: "GET" }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch risk assessments: ${response.status}`);
    }

    return response.json();
}