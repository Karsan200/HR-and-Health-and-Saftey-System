import {
    fetchClockInsForDate,
    fetchAllClockIns,
    submitClockOverride,
    createClockIn,
    deleteClockIn,
    searchAccounts,
    fetchReportedClockInCount,
    formatTime,
    formatDateHeading,
    toBackendTime,
    type ClockInRecord,
} from "../../src/logic/ClockOverridesService";

function makeMockAuthService(overrides: Partial<{ ok: boolean; body: unknown; text: string }> = {}) {
    const { ok = true, body = [], text = "" } = overrides;
    const mockFetch = jest.fn().mockResolvedValue({
        ok,
        json: jest.fn().mockResolvedValue(body),
        text: jest.fn().mockResolvedValue(text),
    });
    return { fetch: mockFetch };
}

function makeRecord(overrides: Partial<ClockInRecord> = {}): ClockInRecord {
    return {
        clockId: "clock-uuid-1",
        employeeName: "John Smith",
        accountId: 1,
        clockInTime: "08:00:00",
        clockOutTime: "17:00:00",
        created: "2026-04-07T08:00:00",
        isAdminAdjusted: false,
        report: null,
        ...overrides,
    };
}


describe("fetchClockInsForDate", () => {
    it("calls the correct endpoint with the given date", async () => {
        const auth = makeMockAuthService({ body: [] });
        await fetchClockInsForDate("2026-04-07", auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/clock-ins?date=2026-04-07",
            expect.objectContaining({ method: "GET" })
        );
    });

    it("returns the parsed JSON array on success", async () => {
        const records = [makeRecord(), makeRecord({ clockId: "clock-uuid-2", employeeName: "Jane Doe" })];
        const auth = makeMockAuthService({ body: records });
        const result = await fetchClockInsForDate("2026-04-07", auth as never);
        expect(result).toEqual(records);
    });

    it("returns an empty array when the response is empty", async () => {
        const auth = makeMockAuthService({ body: [] });
        const result = await fetchClockInsForDate("2026-04-07", auth as never);
        expect(result).toEqual([]);
    });

    it("throws when the response is not ok", async () => {
        const auth = makeMockAuthService({ ok: false, text: "Not Found" });
        await expect(fetchClockInsForDate("2026-04-07", auth as never)).rejects.toThrow(
            "Failed to fetch clock-ins: undefined"
        );
    });

    it("includes credentials in the request", async () => {
        const auth = makeMockAuthService({ body: [] });
        await fetchClockInsForDate("2026-04-07", auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ credentials: "include" })
        );
    });
});


describe("fetchAllClockIns", () => {
    it("calls the correct endpoint", async () => {
        const auth = makeMockAuthService({ body: [] });
        await fetchAllClockIns(auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/clock-ins/all",
            expect.objectContaining({ method: "GET" })
        );
    });

    it("returns the parsed JSON array on success", async () => {
        const records = [makeRecord()];
        const auth = makeMockAuthService({ body: records });
        const result = await fetchAllClockIns(auth as never);
        expect(result).toEqual(records);
    });

    it("throws when the response is not ok", async () => {
        const auth = makeMockAuthService({ ok: false, text: "Server Error" });
        await expect(fetchAllClockIns(auth as never)).rejects.toThrow(
            "Failed to fetch clock-ins: undefined"
        );
    });

    it("includes credentials in the request", async () => {
        const auth = makeMockAuthService({ body: [] });
        await fetchAllClockIns(auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ credentials: "include" })
        );
    });
});


describe("submitClockOverride", () => {
    it("calls the correct endpoint with the clock ID", async () => {
        const auth = makeMockAuthService();
        await submitClockOverride("clock-uuid-1", { clockInTime: "08:00:00", clockOutTime: "17:00:00", removeReport: false }, auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/clock-ins/clock-uuid-1/override",
            expect.objectContaining({ method: "POST" })
        );
    });

    it("sends the override payload as JSON in the request body", async () => {
        const auth = makeMockAuthService();
        const payload = { clockInTime: "09:00:00", clockOutTime: "18:00:00", removeReport: true };
        await submitClockOverride("clock-uuid-1", payload, auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ body: JSON.stringify(payload) })
        );
    });

    it("sets Content-Type to application/json", async () => {
        const auth = makeMockAuthService();
        await submitClockOverride("clock-uuid-1", { clockInTime: null, clockOutTime: null, removeReport: false }, auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ headers: { "Content-Type": "application/json" } })
        );
    });

    it("resolves without error on a successful response", async () => {
        const auth = makeMockAuthService();
        await expect(
            submitClockOverride("clock-uuid-1", { clockInTime: "08:00:00", clockOutTime: null, removeReport: false }, auth as never)
        ).resolves.toBeUndefined();
    });

    it("throws when the response is not ok and the body contains a message", async () => {
        const auth = makeMockAuthService({ ok: false, text: "Record not found" });
        await expect(
            submitClockOverride("clock-uuid-1", { clockInTime: null, clockOutTime: null, removeReport: false }, auth as never)
        ).rejects.toThrow("Record not found");
    });

    it("throws a fallback message when the response body is empty", async () => {
        const auth = makeMockAuthService({ ok: false, text: "" });
        await expect(
            submitClockOverride("clock-uuid-1", { clockInTime: null, clockOutTime: null, removeReport: false }, auth as never)
        ).rejects.toThrow("Override failed");
    });

    it("sends null times correctly", async () => {
        const auth = makeMockAuthService();
        const payload = { clockInTime: null, clockOutTime: null, removeReport: false };
        await submitClockOverride("clock-uuid-1", payload, auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ body: JSON.stringify(payload) })
        );
    });
});


describe("createClockIn", () => {
    it("calls the correct endpoint", async () => {
        const auth = makeMockAuthService({ body: { clockId: "new-uuid" } });
        await createClockIn({ accountId: 1, date: "2026-04-07", clockInTime: "08:00:00", clockOutTime: "17:00:00" }, auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/clock-ins",
            expect.objectContaining({ method: "POST" })
        );
    });

    it("sends the create payload as JSON", async () => {
        const auth = makeMockAuthService({ body: { clockId: "new-uuid" } });
        const request = { accountId: 1, date: "2026-04-07", clockInTime: "08:00:00", clockOutTime: null };
        await createClockIn(request, auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ body: JSON.stringify(request) })
        );
    });

    it("sets Content-Type to application/json", async () => {
        const auth = makeMockAuthService({ body: { clockId: "new-uuid" } });
        await createClockIn({ accountId: 1, date: "2026-04-07", clockInTime: null, clockOutTime: null }, auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ headers: { "Content-Type": "application/json" } })
        );
    });

    it("resolves with the clockId returned by the backend on a successful response", async () => {
        const auth = makeMockAuthService({ body: { clockId: "new-uuid" } });
        await expect(
            createClockIn({ accountId: 1, date: "2026-04-07", clockInTime: null, clockOutTime: null }, auth as never)
        ).resolves.toEqual({ clockId: "new-uuid" });
    });

    it("throws with the response body message when not ok", async () => {
        const auth = makeMockAuthService({ ok: false, text: "A clock-in record already exists for this employee on 2026-04-07." });
        await expect(
            createClockIn({ accountId: 1, date: "2026-04-07", clockInTime: null, clockOutTime: null }, auth as never)
        ).rejects.toThrow("A clock-in record already exists");
    });

    it("throws a fallback message when the response body is empty", async () => {
        const auth = makeMockAuthService({ ok: false, text: "" });
        await expect(
            createClockIn({ accountId: 1, date: "2026-04-07", clockInTime: null, clockOutTime: null }, auth as never)
        ).rejects.toThrow("Create failed");
    });
});


describe("deleteClockIn", () => {
    it("calls the correct endpoint with the clock ID", async () => {
        const auth = makeMockAuthService();
        await deleteClockIn("clock-uuid-1", auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/clock-ins/clock-uuid-1",
            expect.objectContaining({ method: "DELETE" })
        );
    });

    it("includes credentials in the request", async () => {
        const auth = makeMockAuthService();
        await deleteClockIn("clock-uuid-1", auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ credentials: "include" })
        );
    });

    it("resolves without error on a successful response", async () => {
        const auth = makeMockAuthService();
        await expect(deleteClockIn("clock-uuid-1", auth as never)).resolves.toBeUndefined();
    });

    it("throws with the response body message when not ok", async () => {
        const auth = makeMockAuthService({ ok: false, text: "Clock-in record not found." });
        await expect(deleteClockIn("clock-uuid-1", auth as never)).rejects.toThrow("Clock-in record not found.");
    });

    it("throws a fallback message when the response body is empty", async () => {
        const auth = makeMockAuthService({ ok: false, text: "" });
        await expect(deleteClockIn("clock-uuid-1", auth as never)).rejects.toThrow("Delete failed");
    });
});


describe("searchAccounts", () => {
    it("calls the correct endpoint with the encoded query", async () => {
        const auth = makeMockAuthService({ body: [] });
        await searchAccounts("John", auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/accounts/search?query=John",
            expect.objectContaining({ method: "GET" })
        );
    });

    it("returns the parsed JSON array on success", async () => {
        const results = [{ accountId: 1, fullName: "John Smith" }];
        const auth = makeMockAuthService({ body: results });
        const result = await searchAccounts("John", auth as never);
        expect(result).toEqual(results);
    });

    it("returns an empty array immediately for a blank query without calling fetch", async () => {
        const auth = makeMockAuthService({ body: [] });
        const result = await searchAccounts("   ", auth as never);
        expect(result).toEqual([]);
        expect(auth.fetch).not.toHaveBeenCalled();
    });

    it("returns an empty array immediately for an empty string without calling fetch", async () => {
        const auth = makeMockAuthService({ body: [] });
        const result = await searchAccounts("", auth as never);
        expect(result).toEqual([]);
        expect(auth.fetch).not.toHaveBeenCalled();
    });

    it("URL-encodes special characters in the query", async () => {
        const auth = makeMockAuthService({ body: [] });
        await searchAccounts("O'Brien", auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/accounts/search?query=O'Brien",
            expect.anything()
        );
    });

    it("trims whitespace from the query before sending", async () => {
        const auth = makeMockAuthService({ body: [] });
        await searchAccounts("  Alice  ", auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/accounts/search?query=Alice",
            expect.anything()
        );
    });

    it("throws when the response is not ok", async () => {
        const auth = makeMockAuthService({ ok: false, text: "Unauthorized" });
        await expect(searchAccounts("John", auth as never)).rejects.toThrow("Account search failed");
    });

    it("includes credentials in the request", async () => {
        const auth = makeMockAuthService({ body: [] });
        await searchAccounts("John", auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ credentials: "include" })
        );
    });
});


describe("fetchReportedClockInCount", () => {
    it("returns the number of records with a non-null report", async () => {
        const records = [
            makeRecord({ report: { reportId: 1, issue: "Wrong time", created: "2026-04-07T09:00:00" } }),
            makeRecord({ clockId: "clock-uuid-2", report: null }),
            makeRecord({ clockId: "clock-uuid-3", report: { reportId: 2, issue: "Missing", created: "2026-04-07T10:00:00" } }),
        ];
        const auth = makeMockAuthService({ body: records });
        const count = await fetchReportedClockInCount(auth as never);
        expect(count).toBe(2);
    });

    it("returns zero when no records have a report", async () => {
        const records = [makeRecord(), makeRecord({ clockId: "clock-uuid-2" })];
        const auth = makeMockAuthService({ body: records });
        const count = await fetchReportedClockInCount(auth as never);
        expect(count).toBe(0);
    });

    it("returns zero when there are no records at all", async () => {
        const auth = makeMockAuthService({ body: [] });
        const count = await fetchReportedClockInCount(auth as never);
        expect(count).toBe(0);
    });

    it("returns the total when all records have a report", async () => {
        const report = { reportId: 1, issue: "Issue", created: "2026-04-07T09:00:00" };
        const records = [
            makeRecord({ report }),
            makeRecord({ clockId: "clock-uuid-2", report }),
            makeRecord({ clockId: "clock-uuid-3", report }),
        ];
        const auth = makeMockAuthService({ body: records });
        const count = await fetchReportedClockInCount(auth as never);
        expect(count).toBe(3);
    });

    it("calls fetchAllClockIns under the hood", async () => {
        const auth = makeMockAuthService({ body: [] });
        await fetchReportedClockInCount(auth as never);
        expect(auth.fetch).toHaveBeenCalledWith(
            "/api/admin/clock-ins/all",
            expect.anything()
        );
    });

    it("throws if the underlying fetch fails", async () => {
        const auth = makeMockAuthService({ ok: false, text: "Server error" });
        await expect(fetchReportedClockInCount(auth as never)).rejects.toThrow();
    });
});


describe("formatTime", () => {
    it("returns the HH:mm portion of an HH:mm:ss string", () => {
        expect(formatTime("08:00:00")).toBe("08:00");
    });

    it("returns the HH:mm portion of a 17:30:00 string", () => {
        expect(formatTime("17:30:00")).toBe("17:30");
    });

    it("returns null when the input is null", () => {
        expect(formatTime(null)).toBeNull();
    });

    it("returns null when the input is an empty string", () => {
        expect(formatTime("")).toBeNull();
    });

    it("handles midnight correctly", () => {
        expect(formatTime("00:00:00")).toBe("00:00");
    });

    it("handles end of day correctly", () => {
        expect(formatTime("23:59:59")).toBe("23:59");
    });
});


describe("formatDateHeading", () => {
    it("formats a Monday correctly", () => {
        // 2026-04-06 is a Monday
        const result = formatDateHeading("2026-04-06");
        expect(result).toContain("Monday");
        expect(result).toContain("6");
        expect(result).toContain("April");
        expect(result).toContain("2026");
    });

    it("formats a Friday correctly", () => {
        // 2026-04-10 is a Friday
        const result = formatDateHeading("2026-04-10");
        expect(result).toContain("Friday");
        expect(result).toContain("10");
        expect(result).toContain("April");
        expect(result).toContain("2026");
    });

    it("formats the first day of a month correctly", () => {
        // 2026-01-01 is a Thursday
        const result = formatDateHeading("2026-01-01");
        expect(result).toContain("January");
        expect(result).toContain("1");
        expect(result).toContain("2026");
    });

    it("formats the last day of a month correctly", () => {
        const result = formatDateHeading("2026-01-31");
        expect(result).toContain("31");
        expect(result).toContain("January");
        expect(result).toContain("2026");
    });

    it("includes the weekday name in the output", () => {
        const result = formatDateHeading("2026-04-07");
        // Should include some weekday — we don't hardcode the exact day name
        expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });
});


describe("toBackendTime", () => {
    it("appends :00 seconds to an HH:mm string", () => {
        expect(toBackendTime("08:00")).toBe("08:00:00");
    });

    it("appends :00 seconds to a 17:30 string", () => {
        expect(toBackendTime("17:30")).toBe("17:30:00");
    });

    it("returns a string unchanged if it already has seconds", () => {
        expect(toBackendTime("08:00:00")).toBe("08:00:00");
    });

    it("returns null when the input is null", () => {
        expect(toBackendTime(null)).toBeNull();
    });

    it("returns null when the input is an empty string", () => {
        expect(toBackendTime("")).toBeNull();
    });

    it("handles midnight correctly", () => {
        expect(toBackendTime("00:00")).toBe("00:00:00");
    });

    it("handles end of day correctly", () => {
        expect(toBackendTime("23:59")).toBe("23:59:00");
    });
});