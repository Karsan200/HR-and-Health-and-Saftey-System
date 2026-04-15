import type { AuthenticationService } from "./AuthenticationService";

// Types

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

/** A lightweight account summary returned by the employee search endpoint */
export interface AccountSearchResult {
    accountId: number;
    fullName: string;
}

/** Payload for manually creating a clock-in record */
export interface ClockInCreateRequest {
    accountId: number;
    date: string;
    clockInTime: string | null;
    clockOutTime: string | null;
}

/** Payload sent when an admin overrides a clock-in record */
export interface ClockOverrideRequest {
    clockInTime: string | null;
    clockOutTime: string | null;
    removeReport: boolean;
}

// Service functions

/**
 * Fetches all clock-in records for a given date across all employees.
 * Records with an associated employee report are included with the report field populated.
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
 * Fetches all clock-in records across all employees and all dates.
 * Used when the admin enables the "show all" toggle on the overrides page.
 *
 * @param authService the authentication service used to make the request
 */
export async function fetchAllClockIns(
    authService: AuthenticationService,
): Promise<ClockInRecord[]> {
    const response = await authService.fetch("/api/admin/clock-ins/all", {
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
 * Submits an admin override for a specific clock-in record,
 * replacing the existing times with the values provided.
 *
 * @param clockId the UUID of the clock-in record to update
 * @param override the new clock-in and clock-out times
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

/**
 * Creates a new clock-in record for a specific employee on a given date.
 *
 * @param request the details of the record to create
 * @param authService the authentication service used to make the request
 */
export async function createClockIn(
    request: ClockInCreateRequest,
    authService: AuthenticationService,
): Promise<void> {
    const response = await authService.fetch("/api/admin/clock-ins", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const body = await response.text();
        console.error(`Clock-in create failed — status: ${response.status}, body: ${body}`);
        throw new Error(body || `Create failed: ${response.status}`);
    }
}

/**
 * Permanently deletes a clock-in record and its associated report.
 *
 * @param clockId the UUID of the clock-in record to delete
 * @param authService the authentication service used to make the request
 */
export async function deleteClockIn(
    clockId: string,
    authService: AuthenticationService,
): Promise<void> {
    const response = await authService.fetch(`/api/admin/clock-ins/${clockId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        const body = await response.text();
        console.error(`Clock-in delete failed — status: ${response.status}, body: ${body}`);
        throw new Error(body || `Delete failed: ${response.status}`);
    }
}

/**
 * Searches for employee accounts whose name contains the given query string.
 * Returns up to 10 results. Used by the admin clock-in autocomplete.
 *
 * @param query the partial name to search for
 * @param authService the authentication service used to make the request
 */
export async function searchAccounts(
    query: string,
    authService: AuthenticationService,
): Promise<AccountSearchResult[]> {
    if (!query.trim()) return [];

    const response = await authService.fetch(
        `/api/admin/accounts/search?query=${encodeURIComponent(query.trim())}`,
        {
            method: "GET",
            credentials: "include",
        },
    );

    if (!response.ok) {
        const body = await response.text();
        console.error(`Account search failed — status: ${response.status}, body: ${body}`);
        throw new Error(`Account search failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Fetches the number of clock-in records that currently have an employee report attached.
 * Used by pages that need the badge count without loading the full list.
 *
 * @param authService the authentication service used to make the request
 */
export async function fetchReportedClockInCount(
    authService: AuthenticationService,
): Promise<number> {
    const data = await fetchAllClockIns(authService);
    return data.filter((r) => r.report !== null).length;
}

// Formatting helpers

/**
 * Formats a LocalTime string from the backend (HH:mm:ss) into a display
 * string (HH:mm). Returns null if the value is null.
 */
export function formatTime(time: string | null): string | null {
    if (!time) return null;
    return time.substring(0, 5);
}

/**
 * Formats an ISO date string into a human-readable heading label.
 * Example: "2026-04-14" becomes "Tuesday, 14 April 2026".
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
 * Converts an HH:mm string from a time input back into an HH:mm:ss string
 * suitable for sending to the backend as a LocalTime value.
 * Returns null if the input is null or empty.
 */
export function toBackendTime(time: string | null): string | null {
    if (!time) return null;
    return time.length === 5 ? `${time}:00` : time;
}