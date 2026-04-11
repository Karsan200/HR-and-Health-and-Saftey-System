import {
    fetchLeaveTypes,
    findLeaveTypeByName,
    toHex,
    type LeaveTypeResponse,
    type ResolvedLeaveType,
} from "../../src/logic/LeaveTypeService";
import type { AuthenticationService } from "../../src/logic/AuthenticationService";

import BeachAccessOutlined   from "@mui/icons-material/BeachAccessOutlined";
import SickOutlined           from "@mui/icons-material/SickOutlined";
import SchoolOutlined         from "@mui/icons-material/SchoolOutlined";
import ChildCareOutlined      from "@mui/icons-material/ChildCareOutlined";
import CalendarMonthOutlined  from "@mui/icons-material/CalendarMonthOutlined";
import MoneyOffOutlined       from "@mui/icons-material/MoneyOffOutlined";
import PriorityHighOutlined   from "@mui/icons-material/PriorityHighOutlined";
import WorkOffOutlined        from "@mui/icons-material/WorkOffOutlined";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import FavoriteOutlined       from "@mui/icons-material/FavoriteOutlined";
import MilitaryTechOutlined   from "@mui/icons-material/MilitaryTechOutlined";


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

function makeLeaveTypeResponse(overrides: Partial<LeaveTypeResponse> = {}): LeaveTypeResponse {
    return {
        leaveTypeId: 1,
        name:        "Holiday",
        colourBg:    "D0EDDE",
        colourIcon:  "14A45A",
        iconType:    "beach_access",
        ...overrides,
    };
}

describe("fetchLeaveTypes", () => {

    describe("request", () => {
        it("calls authService.fetch with the correct URL", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            await fetchLeaveTypes(mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/leave/types",
                expect.any(Object)
            );
        });

        it("calls authService.fetch with GET method and include credentials", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            await fetchLeaveTypes(mockAuthService);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                { method: "GET", credentials: "include" }
            );
        });
    });

    describe("successful response", () => {
        it("returns an empty array when there are no leave types", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, []));
            const result = await fetchLeaveTypes(mockAuthService);
            expect(result).toEqual([]);
        });

        it("maps leaveTypeId, name, colourBg and colourIcon from the response", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                makeLeaveTypeResponse({ leaveTypeId: 3, name: "Sick Leave", colourBg: "F6CDD0", colourIcon: "D20414" }),
            ]));
            const result = await fetchLeaveTypes(mockAuthService);
            expect(result[0].leaveTypeId).toBe(3);
            expect(result[0].name).toBe("Sick Leave");
            expect(result[0].colourBg).toBe("F6CDD0");
            expect(result[0].colourIcon).toBe("D20414");
        });

        it("returns the correct number of items for multiple types", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                makeLeaveTypeResponse({ leaveTypeId: 1, name: "Holiday" }),
                makeLeaveTypeResponse({ leaveTypeId: 2, name: "Sick Leave" }),
                makeLeaveTypeResponse({ leaveTypeId: 3, name: "Emergency Leave" }),
            ]));
            const result = await fetchLeaveTypes(mockAuthService);
            expect(result).toHaveLength(3);
        });

        it("preserves the order of leave types from the response", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                makeLeaveTypeResponse({ leaveTypeId: 1, name: "Holiday" }),
                makeLeaveTypeResponse({ leaveTypeId: 2, name: "Sick Leave" }),
            ]));
            const result = await fetchLeaveTypes(mockAuthService);
            expect(result[0].name).toBe("Holiday");
            expect(result[1].name).toBe("Sick Leave");
        });
    });

    describe("icon resolution", () => {
        async function resolveIconFor(iconType: string) {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true, [
                makeLeaveTypeResponse({ iconType }),
            ]));
            const result = await fetchLeaveTypes(mockAuthService);
            return result[0].Icon;
        }

        // Snake_case (as stored in DB)
        it("resolves beach_access to BeachAccessOutlined", async () => {
            expect(await resolveIconFor("beach_access")).toBe(BeachAccessOutlined);
        });

        it("resolves sick to SickOutlined", async () => {
            expect(await resolveIconFor("sick")).toBe(SickOutlined);
        });

        it("resolves school to SchoolOutlined", async () => {
            expect(await resolveIconFor("school")).toBe(SchoolOutlined);
        });

        it("resolves child_care to ChildCareOutlined", async () => {
            expect(await resolveIconFor("child_care")).toBe(ChildCareOutlined);
        });

        it("resolves money_off to MoneyOffOutlined", async () => {
            expect(await resolveIconFor("money_off")).toBe(MoneyOffOutlined);
        });

        it("resolves priority_high to PriorityHighOutlined", async () => {
            expect(await resolveIconFor("priority_high")).toBe(PriorityHighOutlined);
        });

        it("resolves work_off to WorkOffOutlined", async () => {
            expect(await resolveIconFor("work_off")).toBe(WorkOffOutlined);
        });

        it("resolves event_available to EventAvailableOutlined", async () => {
            expect(await resolveIconFor("event_available")).toBe(EventAvailableOutlined);
        });

        it("resolves favorite to FavoriteOutlined", async () => {
            expect(await resolveIconFor("favorite")).toBe(FavoriteOutlined);
        });

        it("resolves military_tech to MilitaryTechOutlined", async () => {
            expect(await resolveIconFor("military_tech")).toBe(MilitaryTechOutlined);
        });

        it("resolves calendar_month to CalendarMonthOutlined", async () => {
            expect(await resolveIconFor("calendar_month")).toBe(CalendarMonthOutlined);
        });

        // PascalCase (alternative DB format)
        it("resolves BeachAccess (PascalCase) to BeachAccessOutlined", async () => {
            expect(await resolveIconFor("BeachAccess")).toBe(BeachAccessOutlined);
        });

        it("resolves Sick (PascalCase) to SickOutlined", async () => {
            expect(await resolveIconFor("Sick")).toBe(SickOutlined);
        });

        it("resolves ChildCare (PascalCase) to ChildCareOutlined", async () => {
            expect(await resolveIconFor("ChildCare")).toBe(ChildCareOutlined);
        });

        it("resolves MoneyOff (PascalCase) to MoneyOffOutlined", async () => {
            expect(await resolveIconFor("MoneyOff")).toBe(MoneyOffOutlined);
        });

        it("resolves PriorityHigh (PascalCase) to PriorityHighOutlined", async () => {
            expect(await resolveIconFor("PriorityHigh")).toBe(PriorityHighOutlined);
        });

        // Fallback
        it("falls back to CalendarMonthOutlined for an unrecognised iconType", async () => {
            expect(await resolveIconFor("unknown_icon")).toBe(CalendarMonthOutlined);
        });

        it("falls back to CalendarMonthOutlined for an empty iconType string", async () => {
            expect(await resolveIconFor("")).toBe(CalendarMonthOutlined);
        });

        it("is case-insensitive — SICK resolves to SickOutlined", async () => {
            expect(await resolveIconFor("SICK")).toBe(SickOutlined);
        });

        it("strips hyphens — beach-access resolves to BeachAccessOutlined", async () => {
            expect(await resolveIconFor("beach-access")).toBe(BeachAccessOutlined);
        });

        it("strips numbers — sick123 resolves to SickOutlined", async () => {
            expect(await resolveIconFor("sick123")).toBe(SickOutlined);
        });
    });

    describe("failed response", () => {
        it("throws when the response status is 400", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Bad Request", 400));
            await expect(fetchLeaveTypes(mockAuthService))
                .rejects.toThrow("Failed to fetch leave types: 400");
        });

        it("throws when the response status is 401", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Unauthorized", 401));
            await expect(fetchLeaveTypes(mockAuthService))
                .rejects.toThrow("Failed to fetch leave types: 401");
        });

        it("throws when the response status is 500", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Server Error", 500));
            await expect(fetchLeaveTypes(mockAuthService))
                .rejects.toThrow("Failed to fetch leave types: 500");
        });

        it("reads the response body on failure", async () => {
            const mockResponse = makeMockResponse(false, "Server Error", 500);
            mockFetch.mockResolvedValueOnce(mockResponse);
            await expect(fetchLeaveTypes(mockAuthService)).rejects.toThrow();
            expect(mockResponse.text).toHaveBeenCalled();
        });

        it("throws when authService.fetch rejects due to a network error", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network failure"));
            await expect(fetchLeaveTypes(mockAuthService))
                .rejects.toThrow("Network failure");
        });
    });
});

describe("findLeaveTypeByName", () => {
    const leaveTypes: ResolvedLeaveType[] = [
        { leaveTypeId: 1, name: "Holiday",         colourBg: "D0EDDE", colourIcon: "14A45A", Icon: BeachAccessOutlined },
        { leaveTypeId: 2, name: "Sick Leave",       colourBg: "F6CDD0", colourIcon: "D20414", Icon: SickOutlined },
        { leaveTypeId: 3, name: "Emergency Leave",  colourBg: "FFECCD", colourIcon: "E8960A", Icon: PriorityHighOutlined },
    ];

    it("returns the matching leave type for an exact name match", () => {
        const result = findLeaveTypeByName(leaveTypes, "Holiday");
        expect(result).toBeDefined();
        expect(result!.leaveTypeId).toBe(1);
    });

    it("returns the matching leave type for a multi-word name", () => {
        const result = findLeaveTypeByName(leaveTypes, "Sick Leave");
        expect(result).toBeDefined();
        expect(result!.leaveTypeId).toBe(2);
    });

    it("is case-insensitive — lowercase input matches", () => {
        const result = findLeaveTypeByName(leaveTypes, "holiday");
        expect(result).toBeDefined();
        expect(result!.leaveTypeId).toBe(1);
    });

    it("is case-insensitive — uppercase input matches", () => {
        const result = findLeaveTypeByName(leaveTypes, "SICK LEAVE");
        expect(result).toBeDefined();
        expect(result!.leaveTypeId).toBe(2);
    });

    it("is case-insensitive — mixed case input matches", () => {
        const result = findLeaveTypeByName(leaveTypes, "EMERGENCY leave");
        expect(result).toBeDefined();
        expect(result!.leaveTypeId).toBe(3);
    });

    it("returns undefined when no leave type matches the name", () => {
        const result = findLeaveTypeByName(leaveTypes, "Unpaid Leave");
        expect(result).toBeUndefined();
    });

    it("returns undefined when the list is empty", () => {
        const result = findLeaveTypeByName([], "Holiday");
        expect(result).toBeUndefined();
    });

    it("returns the full resolved leave type object including Icon", () => {
        const result = findLeaveTypeByName(leaveTypes, "Holiday");
        expect(result!.Icon).toBe(BeachAccessOutlined);
        expect(result!.colourBg).toBe("D0EDDE");
        expect(result!.colourIcon).toBe("14A45A");
    });

    it("returns the first match when duplicate names exist", () => {
        const withDuplicate: ResolvedLeaveType[] = [
            { leaveTypeId: 1, name: "Holiday", colourBg: "AAA", colourIcon: "BBB", Icon: BeachAccessOutlined },
            { leaveTypeId: 2, name: "Holiday", colourBg: "CCC", colourIcon: "DDD", Icon: SickOutlined },
        ];
        const result = findLeaveTypeByName(withDuplicate, "Holiday");
        expect(result!.leaveTypeId).toBe(1);
    });
});

describe("toHex", () => {
    it("prepends # to a 6-character hex code without a hash", () => {
        expect(toHex("D0EDDE")).toBe("#D0EDDE");
    });

    it("returns the value unchanged when it already starts with #", () => {
        expect(toHex("#D0EDDE")).toBe("#D0EDDE");
    });

    it("handles lowercase hex codes", () => {
        expect(toHex("d0edde")).toBe("#d0edde");
    });

    it("handles mixed-case hex codes", () => {
        expect(toHex("D20414")).toBe("#D20414");
    });

    it("does not double-prefix a value that already has #", () => {
        expect(toHex("#14A45A")).not.toBe("##14A45A");
    });

    it("handles a 3-character short hex code", () => {
        expect(toHex("fff")).toBe("#fff");
    });
});