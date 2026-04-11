import { fetchCalendarEvents } from "../../src/logic/LeaveCalendarService";
import type { AuthenticationService } from "../../src/logic/AuthenticationService";

// authService.fetch is what the service calls — mock it directly on the object
const mockFetch = jest.fn();
const mockAuthService = {
    fetch: mockFetch,
} as unknown as AuthenticationService;

beforeEach(() => {
    jest.clearAllMocks();
});

function makeMockResponse(ok: boolean, data: object | string, status = 200) {
    return {
        ok,
        status,
        json: jest.fn().mockResolvedValue(data),
        text: jest.fn().mockResolvedValue(typeof data === "string" ? data : JSON.stringify(data)),
    };
}

describe("fetchCalendarEvents", () => {

    describe("successful fetch", () => {
        it("calls authService.fetch with the correct URL including year and month", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            await fetchCalendarEvents(2026, 4, mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/leave/admin/calendar?year=2026&month=4",
                expect.any(Object)
            );
        });

        it("calls authService.fetch with the correct method and credentials", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            await fetchCalendarEvents(2026, 4, mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                {
                    method: "GET",
                    credentials: "include",
                }
            );
        });

        it("returns an empty array when the response contains no items", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            const result = await fetchCalendarEvents(2026, 4, mockAuthService);
            expect(result).toEqual([]);
        });

        it("maps a single response item to the correct CalendarEvent shape", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                { date: "2026-04-15", employeeName: "John Doe", leaveType: "bookedLeave", notes: "Holiday" },
            ]));
            const result = await fetchCalendarEvents(2026, 4, mockAuthService);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id:    "2026-04-15-John Doe-0",
                date:  "2026-04-15",
                type:  "bookedLeave",
                label: "John Doe",
                notes: "Holiday",
            });
        });

        it("maps multiple response items with correct incrementing index in id", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                { date: "2026-04-15", employeeName: "John Doe",   leaveType: "bookedLeave",   notes: null },
                { date: "2026-04-16", employeeName: "Jane Smith", leaveType: "sickLeave",     notes: null },
                { date: "2026-04-17", employeeName: "Bob Jones",  leaveType: "trainingLeave", notes: null },
            ]));
            const result = await fetchCalendarEvents(2026, 4, mockAuthService);
            expect(result[0].id).toBe("2026-04-15-John Doe-0");
            expect(result[1].id).toBe("2026-04-16-Jane Smith-1");
            expect(result[2].id).toBe("2026-04-17-Bob Jones-2");
        });

        it("converts a null notes field to undefined", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                { date: "2026-04-15", employeeName: "John Doe", leaveType: "bookedLeave", notes: null },
            ]));
            const result = await fetchCalendarEvents(2026, 4, mockAuthService);
            expect(result[0].notes).toBeUndefined();
        });

        it("preserves a non-null notes string", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                { date: "2026-04-15", employeeName: "John Doe", leaveType: "bookedLeave", notes: "Annual leave" },
            ]));
            const result = await fetchCalendarEvents(2026, 4, mockAuthService);
            expect(result[0].notes).toBe("Annual leave");
        });

        it("passes the leaveType string through as the event type without transformation", async () => {
            const types = ["Holiday", "Sick Leave", "Emergency Leave", "Unpaid Leave"];
            for (const leaveType of types) {
                mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                    { date: "2026-04-15", employeeName: "Test User", leaveType, notes: null },
                ]));
                const result = await fetchCalendarEvents(2026, 4, mockAuthService);
                expect(result[0].type).toBe(leaveType);
            }
        });
    });

    describe("failed fetch", () => {
        it("throws an error when the response is not ok", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Bad Request", 400));
            await expect(fetchCalendarEvents(2026, 4, mockAuthService))
                .rejects.toThrow("Failed to fetch calendar data: 400");
        });

        it("throws an error containing the status code for a 401", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Unauthorized", 401));
            await expect(fetchCalendarEvents(2026, 4, mockAuthService))
                .rejects.toThrow("Failed to fetch calendar data: 401");
        });

        it("throws an error containing the status code for a 500", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Internal Server Error", 500));
            await expect(fetchCalendarEvents(2026, 4, mockAuthService))
                .rejects.toThrow("Failed to fetch calendar data: 500");
        });

        it("reads the response body when the request fails", async () => {
            const mockResponse = makeMockResponse(false, "Something went wrong", 400);
            mockFetch.mockResolvedValueOnce(mockResponse);
            await expect(fetchCalendarEvents(2026, 4, mockAuthService)).rejects.toThrow();
            expect(mockResponse.text).toHaveBeenCalled();
        });

        it("throws when authService.fetch itself rejects due to a network error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network failure"));
            await expect(fetchCalendarEvents(2026, 4, mockAuthService))
                .rejects.toThrow("Network failure");
        });
    });
});