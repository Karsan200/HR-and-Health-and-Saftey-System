import type { AuthenticationService } from "./AuthenticationService";

export interface UploadLicencePayload {
    title: string;
    employeeId: number;
    file: File;
}

function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

export async function uploadDrivingLicence(
    payload: UploadLicencePayload,
    authenticationService: AuthenticationService
): Promise<void> {
    const nameParts = payload.file.name.split(".");
    const extension = nameParts.length > 1 ? nameParts.pop()! : "jpg";
    const content = await readFileAsBase64(payload.file);

    const body = {
        title: payload.title,
        employeeId: payload.employeeId,
        extension,
        content,
    };

    const response = await authenticationService.fetch("/api/admin/driving-licence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "Unknown error");
        throw new Error(`Upload failed: ${text}`);
    }
}