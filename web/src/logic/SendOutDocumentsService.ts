import type { AuthenticationService } from "./AuthenticationService";

export type DocumentCategory = "policy" | "sop" | "handbook";

export interface SendOutDocumentPayload {
    title: string;
    category: DocumentCategory;
    requireSignature: boolean;
    file: File;
    recipientIds: number[];
}

/**
 * Strips a trailing ".pdf" (case-insensitive) from a string.
 * Used to pre-fill the title field from a dropped filename.
 */
export function stripPdfExtension(name: string): string {
    return name.replace(/\.pdf$/i, "");
}

/**
 * Reads a File object as a base64 string with no data-URI prefix.
 */
function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the "data:application/pdf;base64," prefix
            resolve(result.split(",")[1]);
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

/**
 * Sends a document to POST /api/admin/documents/send-out.
 * Title cleaning and category-specific validation are also enforced on the
 * backend, but we mirror the handbook check here so the UI can surface a
 * friendly message before making a network call.
 */
export async function sendOutDocument(
    payload: SendOutDocumentPayload,
    authenticationService: AuthenticationService
): Promise<void> {
    const title = stripPdfExtension(payload.title.trim());

    if (payload.category === "handbook" && !title.toLowerCase().includes("handbook")) {
        throw new Error("Handbook documents must include the word 'handbook' in the title.");
    }

    const content = await readFileAsBase64(payload.file);

    const body = {
        title,
        category: payload.category,
        requireSignature: payload.requireSignature,
        content,
        recipientIds: payload.recipientIds,
    };

    const response = await authenticationService.fetch("/api/documents/admin/send-out", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "Unknown error");
        throw new Error(`Upload failed: ${text}`);
    }
}