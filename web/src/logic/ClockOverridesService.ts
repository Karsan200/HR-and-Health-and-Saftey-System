import type { AuthenticationService } from "./AuthenticationService";

// ── Types ─────────────────────────────────────────────────────────────────────

/** A clock-in report submitted by an employee about an incorrect clock-in */
export interface ClockInReport {
    reportId: number;
    issue: string;
    created: string;
}

/** A single clock-in record, optionally carrying a report if one has been filed */
export interface ClockInRecord {
    clockId: string;
    employeeName: string;
    accountId: number;
    clockInTime: string | null;
    clockOutTime: string | null;
    created: string;
    report: ClockInReport | null;
}

/** Payload sent when an admin overrides a clock-in record */
export interface ClockOverrideRequest {
    clockInTime: string | null;
    clockOutTime: string | null;

}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Fetches all clock-in records for a given date.
 * Records with associated reports are included and flagged via the report field.
 *
 * @param date ISO date string (YYYY-MM-DD)
 * @param authService the authentication service used to make the request
 */
export async function fetchClockInsForDate(
    date: string,
    authService: AuthenticationService,
): Promise<ClockInRecord[]> {
    const response = await authService.fetch(`/api/admin/clock-ins?date=${date}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const body = await response.text();
        console.error(`Clock-in fetch failed — status: ${response.status}, body: ${body}`);
        throw new Error(`Failed to fetch clock-ins: ${response.status}`);
    }

    return response.json();
}

/**
 * Submits an admin override for a specific clock-in record.
 *
 * @param clockId the UUID of the clock-in record to update
 * @param override the new times and an optional admin note
 * @param authService the authentication service used to make the request
 */
export async function submitClockOverride(
    clockId: string,
    override: ClockOverrideRequest,
    authService: AuthenticationService,
): Promise<void> {
    const response = await authService.fetch(`/api/admin/clock-ins/${clockId}/override`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(override),
    });

    if (!response.ok) {
        const body = await response.text();
        console.error(`Clock override failed — status: ${response.status}, body: ${body}`);
        throw new Error(body || `Override failed: ${response.status}`);
    }
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/**
 * Formats a LocalTime string from the backend (HH:mm:ss) into a display
 * string (HH:mm). Returns null if the time is null.
 */
export function formatTime(time: string | null): string | null {
    if (!time) return null;
    return time.substring(0, 5);
}

/**
 * Formats an ISO date string into a human-readable label for the page heading.
 * e.g. "2026-04-14" → "Tuesday, 14 April 2026"
 */
export function formatDateHeading(iso: string): string {
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/**
 * Converts a Dayjs object or HH:mm string from the MUI TimePicker back into
 * a HH:mm:ss string suitable for sending to the backend.
 */
export function toBackendTime(time: string | null): string | null {
    if (!time) return null;
    return time.length === 5 ? `${time}:00` : time;
}