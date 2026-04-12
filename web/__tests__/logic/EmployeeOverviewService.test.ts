import {
    getEmployees,
    getEmployeeOverview,
    sanitiseEmployeeSearch,
} from "../../src/logic/EmployeeOverviewService";
import { AuthenticationService } from "../../src/logic/AuthenticationService";

type MockJsonResponse = {
    ok: boolean;
    json: jest.Mock<Promise<unknown>, []>;
};

type MockFetch = jest.Mock<Promise<MockJsonResponse>, [string, RequestInit?]>;

type MockAuthenticationService = {
    fetch: MockFetch;
};

describe("EmployeeOverviewService", () => {
    function makeAuth(fetchMock: MockFetch): AuthenticationService {
        const mockAuthService: MockAuthenticationService = {
            fetch: fetchMock,
        };

        return mockAuthService as unknown as AuthenticationService;
    }

    function makeResponse(ok: boolean, body: unknown = {}): MockJsonResponse {
        return {
            ok,
            json: jest.fn().mockResolvedValue(body),
        };
    }

    describe("sanitiseEmployeeSearch", () => {
        it("returns an empty string when given an empty string", () => {
            expect(sanitiseEmployeeSearch("")).toBe("");
        });

        it("trims leading and trailing whitespace", () => {
            expect(sanitiseEmployeeSearch("  john doe  ")).toBe("john doe");
        });

        it("collapses repeated internal whitespace into a single space", () => {
            expect(sanitiseEmployeeSearch("john     doe")).toBe("john doe");
        });

        it("collapses tabs and newlines into single spaces", () => {
            expect(sanitiseEmployeeSearch("john\t\ndoe")).toBe("john doe");
        });

        it("returns a string no longer than 100 characters", () => {
            const longSearch = "a".repeat(150);
            expect(sanitiseEmployeeSearch(longSearch)).toHaveLength(100);
        });

        it("trims and then applies the 100 character limit", () => {
            const input = `   ${"a".repeat(110)}   `;
            expect(sanitiseEmployeeSearch(input)).toBe("a".repeat(100));
        });
    });

    describe("getEmployees", () => {
        it("calls the employees endpoint with no search query when search is empty", async () => {
            // Given a successful employees response with no search
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, []));
            const auth = makeAuth(fetchMock);

            // When employees are requested with an empty search
            await getEmployees(auth, "");

            // Then the base employees endpoint should be called
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/employees",
                expect.objectContaining({
                    method: "GET",
                })
            );
        });

        it("uses the default empty search when no search argument is passed", async () => {
            // Given a successful employees response and no explicit search argument
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, []));
            const auth = makeAuth(fetchMock);

            // When employees are requested without a search argument
            await getEmployees(auth);

            // Then the base employees endpoint should be called
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/employees",
                expect.objectContaining({
                    method: "GET",
                })
            );
        });

        it("sanitises the search term before building the request URL", async () => {
            // Given a successful employees response and a search with extra whitespace
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, []));
            const auth = makeAuth(fetchMock);

            // When employees are requested with a non-sanitised search term
            await getEmployees(auth, "  john     doe  ");

            // Then the request should use the sanitised query value
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/employees?search=john%20doe",
                expect.objectContaining({
                    method: "GET",
                })
            );
        });

        it("URL-encodes special characters in the sanitised search term", async () => {
            // Given a successful employees response and a search containing reserved URL characters
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, []));
            const auth = makeAuth(fetchMock);

            // When employees are requested with a search containing special characters
            await getEmployees(auth, "john & jane");

            // Then the search term should be encoded in the query string
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/employees?search=john%20%26%20jane",
                expect.objectContaining({
                    method: "GET",
                })
            );
        });

        it("falls back to the base employees endpoint when sanitising leaves an empty string", async () => {
            // Given a successful employees response and a search containing only whitespace
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, []));
            const auth = makeAuth(fetchMock);

            // When employees are requested with a whitespace-only search
            await getEmployees(auth, "     ");

            // Then the base employees endpoint should be called
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/employees",
                expect.objectContaining({
                    method: "GET",
                })
            );
        });

        it("returns the parsed JSON on success", async () => {
            // Given a successful employees response with JSON data
            const fetchMock = jest.fn().mockResolvedValue(
                makeResponse(true, [
                    { accountId: 1, fullName: "John Doe", position: "Engineer" },
                ])
            );
            const auth = makeAuth(fetchMock);

            // When employees are requested
            const result = await getEmployees(auth, "john");

            // Then the parsed employees list should be returned
            expect(result).toEqual([
                { accountId: 1, fullName: "John Doe", position: "Engineer" },
            ]);
        });

        it("throws when the employees response is not ok", async () => {
            // Given the employees request returns a failed response
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(false));
            const auth = makeAuth(fetchMock);

            // Then requesting employees should throw an error
            await expect(getEmployees(auth, "john")).rejects.toThrow("Failed to fetch employees");
        });
    });

    describe("getEmployeeOverview", () => {
        it("calls the employee overview endpoint with the given account id", async () => {
            // Given a successful employee overview response
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, {
                accountId: 1,
                fullName: "John Doe",
                position: "Engineer",
                email: "john@example.com",
                hoursWorkedThisMonth: 40,
                latesThisMonth: 1,
                upcomingLeave: null,
            }));
            const auth = makeAuth(fetchMock);

            // When an employee overview is requested
            await getEmployeeOverview(auth, 1);

            // Then the correct employee overview endpoint should be called
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/employees/1",
                expect.objectContaining({
                    method: "GET",
                })
            );
        });

        it("returns the parsed JSON on success", async () => {
            // Given a successful employee overview response with JSON data
            const overview = {
                accountId: 1,
                fullName: "John Doe",
                position: "Engineer",
                email: "john@example.com",
                hoursWorkedThisMonth: 40,
                latesThisMonth: 1,
                upcomingLeave: {
                    leaveType: "Annual Leave",
                    startDate: "2026-08-03",
                    endDate: "2026-08-08",
                },
            };

            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, overview));
            const auth = makeAuth(fetchMock);

            // When the employee overview is requested
            const result = await getEmployeeOverview(auth, 1);

            // Then the parsed employee overview should be returned
            expect(result).toEqual(overview);
        });

        it("throws when the account id is zero", async () => {
            // Given an invalid account id of zero
            const fetchMock = jest.fn();
            const auth = makeAuth(fetchMock);

            // Then requesting the employee overview should throw before fetch is called
            await expect(getEmployeeOverview(auth, 0)).rejects.toThrow("Invalid employee id");
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it("throws when the account id is negative", async () => {
            // Given an invalid negative account id
            const fetchMock = jest.fn();
            const auth = makeAuth(fetchMock);

            // Then requesting the employee overview should throw before fetch is called
            await expect(getEmployeeOverview(auth, -1)).rejects.toThrow("Invalid employee id");
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it("throws when the account id is not an integer", async () => {
            // Given an invalid non-integer account id
            const fetchMock = jest.fn();
            const auth = makeAuth(fetchMock);

            // Then requesting the employee overview should throw before fetch is called
            await expect(getEmployeeOverview(auth, 1.5)).rejects.toThrow("Invalid employee id");
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it("throws when the overview response is not ok", async () => {
            // Given the employee overview request returns a failed response
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(false));
            const auth = makeAuth(fetchMock);

            // Then requesting the employee overview should throw an error
            await expect(getEmployeeOverview(auth, 1)).rejects.toThrow("Failed to fetch employee overview");
        });
    });
});
