import {
    buildCreateEmployeeRequest,
    createEmployee,
    getEmployees,
    getEmployeeOverview,
    normalisePosition,
    sanitiseAddress,
    sanitiseEmail,
    sanitiseEmployeeSearch,
    sanitiseName,
    sanitisePassword,
    sanitisePhoneNumber,
    sanitisePostalCode,
    sanitiseUsername,
    validateCreateEmployeeRequest,
} from "../../src/logic/EmployeeOverviewService";
import { AuthenticationService } from "../../src/logic/AuthenticationService";

type MockHeaders = {
    get: jest.Mock<string | null, [string]>;
};

type MockJsonResponse = {
    ok: boolean;
    status?: number;
    json: jest.Mock<Promise<unknown>, []>;
    text?: jest.Mock<Promise<string>, []>;
    headers?: MockHeaders;
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

    function makeResponse(
        ok: boolean,
        body: unknown = {},
        status = 200,
        contentType = "application/json"
    ): MockJsonResponse {
        return {
            ok,
            status,
            json: jest.fn().mockResolvedValue(body),
            text: jest.fn().mockResolvedValue(typeof body === "string" ? body : JSON.stringify(body)),
            headers: {
                get: jest.fn().mockImplementation((name: string) =>
                    name.toLowerCase() === "content-type" ? contentType : null
                ),
            },
        };
    }

    function makeValidCreateRequest(overrides = {}) {
        return {
            firstName: "Tom",
            surname: "Jones",
            email: "tom@example.com",
            phoneNumber: "07123456789",
            addressOne: "1 High Street",
            addressTwo: "",
            postalCode: "AB12CD",
            position: "Employee",
            username: "tom.jones",
            password: "password123",
            ...overrides,
        };
    }

    describe("sanitiseName", () => {
        it("trims, collapses whitespace, and enforces the max length", () => {
            expect(sanitiseName(`  John     Smith ${"a".repeat(60)}`)).toBe(("John Smith " + "a".repeat(60)).slice(0, 50));
        });
    });

    describe("sanitiseEmail", () => {
        it("trims, lowercases, and enforces the max length", () => {
            expect(sanitiseEmail("  TEST@EXAMPLE.COM  ")).toBe("test@example.com");
            expect(sanitiseEmail("A".repeat(300) + "@EXAMPLE.COM")).toHaveLength(254);
        });
    });

    describe("sanitisePhoneNumber", () => {
        it("removes invalid characters, strips spacing punctuation, and enforces the max length", () => {
            expect(sanitisePhoneNumber(" +44 (0) 7123-456-789 abc ")).toBe("+4407123456789");
            expect(sanitisePhoneNumber("1".repeat(30))).toHaveLength(17);
        });
    });

    describe("sanitiseAddress", () => {
        it("trims, collapses whitespace, and enforces the max length", () => {
            expect(sanitiseAddress("  1   High   Street  ")).toBe("1 High Street");
            expect(sanitiseAddress("a".repeat(150))).toHaveLength(120);
        });
    });

    describe("sanitisePostalCode", () => {
        it("trims, uppercases, collapses whitespace, and enforces the max length", () => {
            expect(sanitisePostalCode("  ab 12 cd  ")).toBe("AB 12 CD".slice(0, 8));
            expect(sanitisePostalCode("abcdefghijk")).toHaveLength(8);
        });
    });

    describe("sanitiseUsername", () => {
        it("trims and enforces the max length", () => {
            expect(sanitiseUsername("  tom.jones  ")).toBe("tom.jones");
            expect(sanitiseUsername("a".repeat(40))).toHaveLength(32);
        });
    });

    describe("sanitisePassword", () => {
        it("trims only the start of the password", () => {
            expect(sanitisePassword("   password123   ")).toBe("password123   ");
        });
    });

    describe("normalisePosition", () => {
        it("normalises employee", () => {
            expect(normalisePosition(" employee ")).toBe("Employee");
        });

        it("normalises manager", () => {
            expect(normalisePosition(" manager ")).toBe("Manager");
        });

        it("normalises admin", () => {
            expect(normalisePosition(" admin ")).toBe("Admin");
        });

        it("returns the trimmed original value for unknown positions", () => {
            expect(normalisePosition(" director ")).toBe("director");
        });
    });

    describe("validateCreateEmployeeRequest", () => {
        it.each([
            ["firstName", "", "First name is required."],
            ["surname", "", "Surname is required."],
            ["email", "", "Email is required."],
            ["phoneNumber", "", "Phone number is required."],
            ["addressOne", "", "Address line one is required."],
            ["postalCode", "", "Postal code is required."],
            ["position", "", "Position is required."],
            ["username", "", "Username is required."],
            ["password", "", "Password is required."],
        ])("returns %s required validation errors", (field, value, expected) => {
            const request = makeValidCreateRequest({ [field]: value });
            expect(validateCreateEmployeeRequest(request)).toBe(expected);
        });

        it("returns an email validation error for invalid email addresses", () => {
            expect(validateCreateEmployeeRequest(makeValidCreateRequest({
                email: "not-an-email",
            }))).toBe("Please enter a valid email address.");
        });

        it("returns a username validation error for invalid usernames", () => {
            expect(validateCreateEmployeeRequest(makeValidCreateRequest({
                username: "bad username!",
            }))).toBe("Username may only contain letters, numbers, dots, underscores, and hyphens.");
        });

        it("returns a password length validation error for short passwords", () => {
            expect(validateCreateEmployeeRequest(makeValidCreateRequest({
                password: "short",
            }))).toBe("Password must be at least 8 characters.");
        });

        it("returns a position validation error for unknown positions", () => {
            expect(validateCreateEmployeeRequest(makeValidCreateRequest({
                position: "Director",
            }))).toBe("Position must be Employee, Manager, or Admin.");
        });

        it("returns null for a valid request", () => {
            expect(validateCreateEmployeeRequest(makeValidCreateRequest())).toBeNull();
        });
    });

    describe("buildCreateEmployeeRequest", () => {
        it("sanitises and normalises all fields", () => {
            expect(buildCreateEmployeeRequest(makeValidCreateRequest({
                firstName: "  Tom  ",
                surname: "  Jones  ",
                email: "  TOM@EXAMPLE.COM  ",
                phoneNumber: " +44 (0) 7123-456-789 ",
                addressOne: "  1   High   Street  ",
                addressTwo: "  Apt    4 ",
                postalCode: "  ab12cd  ",
                position: " manager ",
                username: "  tom.jones  ",
                password: "   password123",
            }))).toEqual({
                firstName: "Tom",
                surname: "Jones",
                email: "tom@example.com",
                phoneNumber: "+4407123456789",
                addressOne: "1 High Street",
                addressTwo: "Apt 4",
                postalCode: "AB12CD",
                position: "Manager",
                username: "tom.jones",
                password: "password123",
            });
        });
    });

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

    describe("createEmployee", () => {
        it("posts the built request body to the create employee endpoint", async () => {
            // Given a successful create employee response
            const request = makeValidCreateRequest({
                firstName: " Tom ",
                email: " TOM@EXAMPLE.COM ",
                position: " manager ",
            });

            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, {
                accountId: 10,
                fullName: "Tom Jones",
                position: "Manager",
            }));

            // When a create employee request is made
            const auth = makeAuth(fetchMock);
            await createEmployee(auth, request);

            // Then the request should be made to the correct endpoint with the built request body
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/employees",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firstName: "Tom",
                        surname: "Jones",
                        email: "tom@example.com",
                        phoneNumber: "07123456789",
                        addressOne: "1 High Street",
                        addressTwo: "",
                        postalCode: "AB12CD",
                        position: "Manager",
                        username: "tom.jones",
                        password: "password123",
                    }),
                }
            );
        });

        it("returns the parsed JSON on success", async () => {
            // Given a successful create employee response with JSON data
            const created = {
                accountId: 10,
                fullName: "Tom Jones",
                position: "Employee",
            };
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, created));

            // When a create employee request is made
            const auth = makeAuth(fetchMock);
            const result = await createEmployee(auth, makeValidCreateRequest());

            // Then the parsed created employee should be returned
            expect(result).toEqual(created);
        });

        it("throws validation errors before fetch is called", async () => {
            // Given an invalid create employee request with a bad email
            const fetchMock = jest.fn();
            const auth = makeAuth(fetchMock);

            // Then creating the employee should throw a validation error before fetch is called
            await expect(
                createEmployee(auth, makeValidCreateRequest({ email: "bad-email" }))
            ).rejects.toThrow("Please enter a valid email address.");
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it("throws the API json message when the error response contains a message property", async () => {
            // Given a failed create employee response with a JSON error message
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(
                false,
                { message: "Email already exists." },
                409
            ));

            // When a create employee request is made, then the error message from the response should be thrown
            const auth = makeAuth(fetchMock);
            await expect(
                createEmployee(auth, makeValidCreateRequest())
            ).rejects.toThrow("Email already exists.");
        });

        it("throws the API json string when the error response is a json string", async () => {
            // Given a failed create employee response with a JSON string error message
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(
                false,
                "Username already exists.",
                409
            ));
            // When a create employee request is made, then the error message from the response should be thrown
            const auth = makeAuth(fetchMock);
            await expect(
                createEmployee(auth, makeValidCreateRequest())
            ).rejects.toThrow("Username already exists.");
        });

        it("throws the plain text body when the error response is not json", async () => {
            // Given a failed create employee response with a plain text error message
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(
                false,
                "Forbidden by policy.",
                403,
                "text/plain"
            ));
            // When a create employee request is made, then the error message from the response should be thrown
            const auth = makeAuth(fetchMock);
            await expect(
                createEmployee(auth, makeValidCreateRequest())
            ).rejects.toThrow("Forbidden by policy.");
        });

        it("falls back to the 400 message when the error body is blank", async () => {
            // Given a failed create employee response with a blank body
            const response = makeResponse(false, "", 400, "text/plain");
            response.text = jest.fn().mockResolvedValue("   ");
            const fetchMock = jest.fn().mockResolvedValue(response);
            const auth = makeAuth(fetchMock);

            // When a create employee request is made, then the 400 error message should be thrown
            await expect(
                createEmployee(auth, makeValidCreateRequest())
            ).rejects.toThrow("Please check the employee details and try again.");
        });

        it("falls back to the 403 message when the error body is blank", async () => {
            // Given a failed create employee response with a blank body
            const response = makeResponse(false, "", 403, "text/plain");
            response.text = jest.fn().mockResolvedValue("   ");
            const fetchMock = jest.fn().mockResolvedValue(response);
            const auth = makeAuth(fetchMock);

            // When a create employee request is made, then the 403 error message should be thrown
            await expect(
                createEmployee(auth, makeValidCreateRequest())
            ).rejects.toThrow("You do not have permission to create this employee.");
        });

        it("falls back to the generic message for other blank error responses", async () => {
            // Given a failed create employee response with a blank body and a non-400/403 status
            const response = makeResponse(false, "", 500, "text/plain");
            response.text = jest.fn().mockResolvedValue("   ");
            const fetchMock = jest.fn().mockResolvedValue(response);
            const auth = makeAuth(fetchMock);

            // When a create employee request is made, then the generic error message should be thrown
            await expect(
                createEmployee(auth, makeValidCreateRequest())
            ).rejects.toThrow("Failed to create employee.");
        });

        it("falls back to the generic message when parsing the error body throws", async () => {
            // Given a failed create employee response that throws when parsing the body
            const response = makeResponse(false, "", 500, "application/json");
            response.json = jest.fn().mockRejectedValue(new Error("bad json"));
            const fetchMock = jest.fn().mockResolvedValue(response);
            const auth = makeAuth(fetchMock);

            // When a create employee request is made, then the generic error message should be thrown
            await expect(
                createEmployee(auth, makeValidCreateRequest())
            ).rejects.toThrow("Failed to create employee.");
        });
    });
});
