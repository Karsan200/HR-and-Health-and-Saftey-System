import { AppSettings } from "../AppSettings";
import type { AuthenticationService } from "./AuthenticationService";
import type { CalendarEvent, CalendarEventType } from "../pages/CalendarPage";

interface LeaveCalendarItemResponse {
    date: string;
    employeeName: string;
    leaveType: string;
    notes: string | null;
}

export async function fetchCalendarEvents(
    year: number,
    month: number,
    authService: AuthenticationService,
): Promise<CalendarEvent[]> {
    const response = await fetch(
        `${AppSettings.API_URL}/api/leave/admin/calendar?year=${year}&month=${month}`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${authService.auth.accessToken}`,
            },
        }
    );

    if (!response.ok) {
        const body = await response.text();
        console.error(`Calendar fetch failed — status: ${response.status}, body: ${body}`);
        throw new Error(`Failed to fetch calendar data: ${response.status}`);
    }

    const data: LeaveCalendarItemResponse[] = await response.json();

    return data.map((item, index) => ({
        id: `${item.date}-${item.employeeName}-${index}`,
        date: item.date,
        type: item.leaveType as CalendarEventType,
        label: item.employeeName,
        notes: item.notes ?? undefined,
    }));
}