import {
    fetchPendingLeave,
    approveLeaveRequest,
    declineLeaveRequest,
    formatDateRange,
    formatRequestedOn,
    fetchPendingLeaveCount,
    type PendingLeaveRequest,
} from "../../src/logic/PendingRequestsService";
import type { AuthenticationService } from "../../src/logic/AuthenticationService";


const mockFetch = jest.fn();
const mockAuthService = { fetch: mockFetch } as unknown as AuthenticationService;

beforeEach(() => {
    jest.clearAllMocks();
});

function makeMockResponse(ok: boolean, data: unknown, status = 200) {
    return {
        ok,
        status,
        json: jest.fn().mockResolvedValue(data),
        text: jest.fn().mockResolvedValue(
            typeof data === "string" ? data : JSON.stringify(data)
        ),
    };
}

const pendingRequest: PendingLeaveRequest = {
    leaveId: 1,
    employeeName: "John Doe",
    leaveType: "Holiday",
    startDate: "2026-06-01T08:00:00",
    endDate: "2026-06-05T17:00:00",
    notes: "Summer holiday",
    created: "2026-05-01T10:00:00",
};

const pendingRequestNoNotes: PendingLeaveRequest = {
    leaveId: 2,
    employeeName: "Jane Smith",
    leaveType: "Sick Leave",
    startDate: "2026-05-10T08:00:00",
    endDate: "2026-05-10T17:00:00",
    notes: null,
    created: "2026-05-10T09:00:00",
};

describe("fetchPendingLeave", () => {

    describe("request", () => {
        it("calls authService.fetch with the correct URL", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            await fetchPendingLeave(mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/leave/admin/pending",
                expect.any(Object)
            );
        });

        it("calls authService.fetch with GET method and include credentials", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            await fetchPendingLeave(mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                { method: "GET", credentials: "include" }
            );
        });
    });

    describe("successful response", () => {
        it("returns an empty array when there are no pending requests", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            const result = await fetchPendingLeave(mockAuthService);
            expect(result).toEqual([]);
        });

        it("returns a single pending request correctly", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [pendingRequest]));
            const result = await fetchPendingLeave(mockAuthService);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(pendingRequest);
        });

        it("returns multiple pending requests in order", async () => {
            mockFetch.mockResolvedValueOnce(
                makeMockResponse(true, [pendingRequest, pendingRequestNoNotes])
            );
            const result = await fetchPendingLeave(mockAuthService);
            expect(result).toHaveLength(2);
            expect(result[0].leaveId).toBe(1);
            expect(result[1].leaveId).toBe(2);
        });

        it("preserves null notes on the returned object", async () => {
            mockFetch.mockResolvedValueOnce(
                makeMockResponse(true, [pendingRequestNoNotes])
            );
            const result = await fetchPendingLeave(mockAuthService);
            expect(result[0].notes).toBeNull();
        });

        it("preserves all fields on the returned object", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [pendingRequest]));
            const result = await fetchPendingLeave(mockAuthService);
            expect(result[0]).toMatchObject({
                leaveId:      1,
                employeeName: "John Doe",
                leaveType:    "Holiday",
                startDate:    "2026-06-01T08:00:00",
                endDate:      "2026-06-05T17:00:00",
                notes:        "Summer holiday",
                created:      "2026-05-01T10:00:00",
            });
        });
    });

    describe("failed response", () => {
        it("throws when the response status is 400", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Bad Request", 400));
            await expect(fetchPendingLeave(mockAuthService))
                .rejects.toThrow("Failed to fetch pending requests: 400");
        });

        it("throws when the response status is 401", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Unauthorized", 401));
            await expect(fetchPendingLeave(mockAuthService))
                .rejects.toThrow("Failed to fetch pending requests: 401");
        });

        it("throws when the response status is 500", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Server Error", 500));
            await expect(fetchPendingLeave(mockAuthService))
                .rejects.toThrow("Failed to fetch pending requests: 500");
        });

        it("reads the response body on failure", async () => {
            const mockResponse = makeMockResponse(false, "Server Error", 500);
            mockFetch.mockResolvedValueOnce(mockResponse);
            await expect(fetchPendingLeave(mockAuthService)).rejects.toThrow();
            expect(mockResponse.text).toHaveBeenCalled();
        });

        it("throws when authService.fetch rejects due to a network error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network failure"));
            await expect(fetchPendingLeave(mockAuthService))
                .rejects.toThrow("Network failure");
        });
    });
});

describe("approveLeaveRequest", () => {

    describe("request", () => {
        it("calls authService.fetch with the correct URL for the given leaveId", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await approveLeaveRequest(42, "Looks good", mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/leave/admin/42/approve",
                expect.any(Object)
            );
        });

        it("calls authService.fetch with POST method, credentials and JSON content type", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await approveLeaveRequest(1, "Approved", mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method:      "POST",
                    credentials: "include",
                    headers:     { "Content-Type": "application/json" },
                })
            );
        });

        it("sends the response string in the request body", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await approveLeaveRequest(1, "Have a great holiday!", mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({ response: "Have a great holiday!" }),
                })
            );
        });

        it("sends an empty string response when no reason is provided", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await approveLeaveRequest(1, "", mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({ response: "" }),
                })
            );
        });
    });

    describe("successful response", () => {
        it("resolves without returning a value on success", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await expect(approveLeaveRequest(1, "OK", mockAuthService))
                .resolves.toBeUndefined();
        });
    });

    describe("failed response", () => {
        it("throws an error containing the response body text when not ok", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Already approved", 400));
            await expect(approveLeaveRequest(1, "", mockAuthService))
                .rejects.toThrow("Already approved");
        });

        it("falls back to a status message when the response body is empty", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "", 500));
            await expect(approveLeaveRequest(1, "", mockAuthService))
                .rejects.toThrow("Approve failed: 500");
        });

        it("throws when authService.fetch rejects due to a network error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network failure"));
            await expect(approveLeaveRequest(1, "", mockAuthService))
                .rejects.toThrow("Network failure");
        });

        it("reads the response body on failure", async () => {
            const mockResponse = makeMockResponse(false, "Conflict", 409);
            mockFetch.mockResolvedValueOnce(mockResponse);
            await expect(approveLeaveRequest(1, "", mockAuthService)).rejects.toThrow();
            expect(mockResponse.text).toHaveBeenCalled();
        });
    });
});

describe("declineLeaveRequest", () => {

    describe("request", () => {
        it("calls authService.fetch with the correct URL for the given leaveId", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await declineLeaveRequest(7, "Not enough cover", mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/leave/admin/7/decline",
                expect.any(Object)
            );
        });

        it("calls authService.fetch with POST method, credentials and JSON content type", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await declineLeaveRequest(1, "Declined", mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method:      "POST",
                    credentials: "include",
                    headers:     { "Content-Type": "application/json" },
                })
            );
        });

        it("sends the response string in the request body", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await declineLeaveRequest(1, "Too many absences", mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({ response: "Too many absences" }),
                })
            );
        });

        it("sends an empty string response when no reason is provided", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await declineLeaveRequest(1, "", mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({ response: "" }),
                })
            );
        });
    });

    describe("successful response", () => {
        it("resolves without returning a value on success", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, null, 200));
            await expect(declineLeaveRequest(1, "OK", mockAuthService))
                .resolves.toBeUndefined();
        });
    });

    describe("failed response", () => {
        it("throws an error containing the response body text when not ok", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Already declined", 400));
            await expect(declineLeaveRequest(1, "", mockAuthService))
                .rejects.toThrow("Already declined");
        });

        it("falls back to a status message when the response body is empty", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "", 500));
            await expect(declineLeaveRequest(1, "", mockAuthService))
                .rejects.toThrow("Decline failed: 500");
        });

        it("throws when authService.fetch rejects due to a network error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network failure"));
            await expect(declineLeaveRequest(1, "", mockAuthService))
                .rejects.toThrow("Network failure");
        });

        it("reads the response body on failure", async () => {
            const mockResponse = makeMockResponse(false, "Conflict", 409);
            mockFetch.mockResolvedValueOnce(mockResponse);
            await expect(declineLeaveRequest(1, "", mockAuthService)).rejects.toThrow();
            expect(mockResponse.text).toHaveBeenCalled();
        });
    });
});

describe("formatDateRange", () => {
    it("returns a single date with times when start and end are the same day", () => {
        expect(formatDateRange("2026-02-10T08:00:00", "2026-02-10T17:00:00"))
            .toBe("10 February 2026, 08:00 – 17:00");
    });

    it("returns a range when start and end are different days", () => {
        expect(formatDateRange("2026-03-01T08:00:00", "2026-03-03T17:00:00"))
            .toBe("1 March – 3 March 2026");
    });

    it("uses the end year in the output", () => {
        expect(formatDateRange("2026-12-29T08:00:00", "2027-01-02T17:00:00"))
            .toBe("29 December – 2 January 2027");
    });

    it("handles a multi-week range within the same month", () => {
        expect(formatDateRange("2026-08-14T08:00:00", "2026-08-28T17:00:00"))
            .toBe("14 August – 28 August 2026");
    });

    it("handles a range spanning two months", () => {
        expect(formatDateRange("2026-01-30T08:00:00", "2026-02-03T17:00:00"))
            .toBe("30 January – 3 February 2026");
    });

    it("returns a single date with times for a single day in January", () => {
        expect(formatDateRange("2026-01-01T08:00:00", "2026-01-01T17:00:00"))
            .toBe("1 January 2026, 08:00 – 17:00");
    });

    it("shows times when start and end are the same day but different times", () => {
        expect(formatDateRange("2026-05-10T09:30:00", "2026-05-10T14:45:00"))
            .toBe("10 May 2026, 09:30 – 14:45");
    });
});

describe("formatRequestedOn", () => {
    it("formats a date string into the expected label", () => {
        expect(formatRequestedOn("2026-02-09T10:00:00"))
            .toBe("Requested on 9 February 2026");
    });

    it("includes the year in the output", () => {
        expect(formatRequestedOn("2025-12-25T09:00:00"))
            .toBe("Requested on 25 December 2025");
    });

    it("handles the first day of a month", () => {
        expect(formatRequestedOn("2026-01-01T00:00:00"))
            .toBe("Requested on 1 January 2026");
    });

    it("handles the last day of a month", () => {
        expect(formatRequestedOn("2026-01-31T23:59:59"))
            .toBe("Requested on 31 January 2026");
    });

    it("starts with 'Requested on'", () => {
        expect(formatRequestedOn("2026-05-10T09:00:00"))
            .toMatch(/^Requested on /);
    });
});

describe("fetchPendingLeaveCount", () => {
    it("returns 0 when there are no pending requests", async () => {
        mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
        const count = await fetchPendingLeaveCount(mockAuthService);
        expect(count).toBe(0);
    });

    it("returns the correct count for a single request", async () => {
        mockFetch.mockResolvedValueOnce(makeMockResponse(true, [pendingRequest]));
        const count = await fetchPendingLeaveCount(mockAuthService);
        expect(count).toBe(1);
    });

    it("returns the correct count for multiple requests", async () => {
        mockFetch.mockResolvedValueOnce(
            makeMockResponse(true, [pendingRequest, pendingRequestNoNotes])
        );
        const count = await fetchPendingLeaveCount(mockAuthService);
        expect(count).toBe(2);
    });

    it("calls fetchPendingLeave with the correct auth service", async () => {
        mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
        await fetchPendingLeaveCount(mockAuthService);
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/leave/admin/pending",
            expect.any(Object)
        );
    });

    it("propagates errors from fetchPendingLeave", async () => {
        mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Unauthorized", 401));
        await expect(fetchPendingLeaveCount(mockAuthService))
            .rejects.toThrow("Failed to fetch pending requests: 401");
    });
});