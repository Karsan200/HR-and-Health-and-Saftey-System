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