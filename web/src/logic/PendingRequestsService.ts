import type { AuthenticationService } from "./AuthenticationService";

/** Shape of a pending leave request returned by GET /api/leave/admin/pending */
export interface PendingLeaveRequest {
    leaveId: number;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    notes: string | null;
    created: string;
}

/**
 * Fetches all pending leave requests from the backend.
 * Requires the current user to have ROLE_ADMIN or ROLE_MANAGER.
 */
export async function fetchPendingLeave(
    authService: AuthenticationService,
): Promise<PendingLeaveRequest[]> {
    const response = await authService.fetch("/api/leave/admin/pending", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const body = await response.text();
        console.error(`Pending leave fetch failed — status: ${response.status}, body: ${body}`);
        throw new Error(`Failed to fetch pending requests: ${response.status}`);
    }

    return response.json();
}

/**
 * Approves a pending leave request.
 *
 * @param leaveId     the ID of the leave record to approve
 * @param response    optional admin message stored against the record
 * @param authService the authentication service used to make the request
 */
export async function approveLeaveRequest(
    leaveId: number,
    response: string,
    authService: AuthenticationService,
): Promise<void> {
    const res = await authService.fetch(`/api/leave/admin/${leaveId}/approve`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
    });

    if (!res.ok) {
        const body = await res.text();
        console.error(`Approve failed — status: ${res.status}, body: ${body}`);
        throw new Error(body || `Approve failed: ${res.status}`);
    }
}

/**
 * Declines a pending leave request.
 *
 * @param leaveId     the ID of the leave record to decline
 * @param response    optional admin message stored against the record
 * @param authService the authentication service used to make the request
 */
export async function declineLeaveRequest(
    leaveId: number,
    response: string,
    authService: AuthenticationService,
): Promise<void> {
    const res = await authService.fetch(`/api/leave/admin/${leaveId}/decline`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ response }),
    });

    if (!res.ok) {
        const body = await res.text();
        console.error(`Decline failed — status: ${res.status}, body: ${body}`);
        throw new Error(body || `Decline failed: ${res.status}`);
    }
}

/**
 * Formats a pair of LocalDateTime strings from the backend into a
 * human-readable date range label for display on the request card.
 *
 * Examples:
 *   same day   → "10 February 2026"
 *   date range → "01 March – 03 March 2026"
 */
export function formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const fmt = (d: Date) =>
        d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

    const startStr = fmt(start);
    const endStr = fmt(end);
    const year = end.getFullYear();

    if (startStr === endStr) {
        return `${startStr} ${year}`;
    }

    return `${startStr} – ${endStr} ${year}`;
}

/**
 * Formats a LocalDateTime string from the backend into the
 * "Requested on D Month YYYY" label shown on the request card.
 */
export function formatRequestedOn(created: string): string {
    const date = new Date(created);
    return `Requested on ${date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })}`;
}

/**
 * Fetches the number of currently pending leave requests.
 * Used by pages that need the badge count without loading the full list.
 */
export async function fetchPendingLeaveCount(
    authService: AuthenticationService,
): Promise<number> {
    const data = await fetchPendingLeave(authService);
    return data.length;
}
