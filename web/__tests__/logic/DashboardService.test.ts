import {
    getDashboardSummary,
    getLateArrivals,
    getDocumentSignatures,
    getHazardsReported,
    getRecentActivity,
} from "../../src/logic/DashboardService";
import { AuthenticationService } from "../../src/logic/AuthenticationService";
import type { AuthType } from "../../src/models/AuthType";

type MockJsonResponse = {
    ok: boolean;
    json: jest.Mock<Promise<unknown>, []>;
};

type MockFetch = jest.Mock<Promise<MockJsonResponse>, [string, RequestInit?]>;

type MockAuthenticationService = {
    auth: AuthType;
    fetch: MockFetch;
    refresh: jest.Mock<Promise<void>, []>;
    mfaTotp: jest.Mock<Promise<void>, [string]>;
    login: jest.Mock<Promise<void>, [string, string]>;
};

describe("DashboardService", () => {
    function makeAuth(fetchMock: MockFetch): AuthenticationService {
        const mockAuthService: MockAuthenticationService = {
            auth: {
                accessToken: null,
                setAccessToken: jest.fn(),
                setIsAuthenticated: jest.fn(),
                setIsMfaAuthenticated: jest.fn(),
                isAuthenticated: null,
                isMfaAuthenticated: null
            },
            fetch: fetchMock,
            refresh: jest.fn(),
            mfaTotp: jest.fn(),
            login: jest.fn(),
        };

        return mockAuthService as unknown as AuthenticationService;
    }

    function makeResponse(ok: boolean, body: unknown = {}): MockJsonResponse {
        return {
            ok,
            json: jest.fn().mockResolvedValue(body),
        };
    }

    describe("getDashboardSummary", () => {
        it("returns JSON on success", async () => {
            // Given a successful dashboard summary response is returned by the API
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, { a: 1 }));
            const auth = makeAuth(fetchMock);

            // When the dashboard summary is requested
            const result = await getDashboardSummary(auth);

            // Then the parsed JSON response should be returned to the caller
            expect(result).toEqual({ a: 1 });
        });

        it("throws on failure", async () => {
            // Given the dashboard summary request returns a failed response
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(false));
            const auth = makeAuth(fetchMock);

            // Then requesting the dashboard summary should throw an error
            await expect(getDashboardSummary(auth)).rejects.toThrow();
        });
    });

    describe("getLateArrivals", () => {
        it("uses default range", async () => {
            // Given a successful late arrivals response and no explicit range provided
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true));
            const auth = makeAuth(fetchMock);

            // When late arrivals are requested without passing a range
            await getLateArrivals(auth);

            // Then the request should use the default last-month range
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/late-arrivals?range=last-month",
                expect.any(Object)
            );
        });

        it("uses provided range", async () => {
            // Given a successful late arrivals response and an explicit range value
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true));
            const auth = makeAuth(fetchMock);

            // When late arrivals are requested with a specific range
            await getLateArrivals(auth, "this-week");

            // Then the request should use the provided range value
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/late-arrivals?range=this-week",
                expect.any(Object)
            );
        });

        it("throws on failure", async () => {
            // Given the late arrivals request returns a failed response
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(false));
            const auth = makeAuth(fetchMock);

            // Then requesting late arrivals should throw an error
            await expect(getLateArrivals(auth)).rejects.toThrow();
        });
    });

    describe("getDocumentSignatures", () => {
        it("uses default range", async () => {
            // Given a successful document signatures response and no explicit range provided
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true));
            const auth = makeAuth(fetchMock);

            // When document signatures are requested without passing a range
            await getDocumentSignatures(auth);

            // Then the request should use the default this-month range
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/document-signatures?range=this-month",
                expect.any(Object)
            );
        });

        it("throws on failure", async () => {
            // Given the document signatures request returns a failed response
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(false));
            const auth = makeAuth(fetchMock);

            // Then requesting document signatures should throw an error
            await expect(getDocumentSignatures(auth)).rejects.toThrow();
        });
    });

    describe("getHazardsReported", () => {
        it("uses default range", async () => {
            // Given a successful hazards reported response and no explicit range provided
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true));
            const auth = makeAuth(fetchMock);

            // When hazards reported data is requested without passing a range
            await getHazardsReported(auth);

            // Then the request should use the default this-month range
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/admin/hazards-reported?range=this-month",
                expect.any(Object)
            );
        });

        it("throws on failure", async () => {
            // Given the hazards reported request returns a failed response
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(false));
            const auth = makeAuth(fetchMock);

            // Then requesting hazards reported data should throw an error
            await expect(getHazardsReported(auth)).rejects.toThrow();
        });
    });

    describe("getRecentActivity", () => {
        it("returns JSON", async () => {
            // Given a successful recent activity response is returned by the API
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(true, [{ a: 1 }]));
            const auth = makeAuth(fetchMock);

            // When recent activity is requested
            const result = await getRecentActivity(auth);

            // Then the parsed JSON activity list should be returned
            expect(result).toEqual([{ a: 1 }]);
        });

        it("throws on failure", async () => {
            // Given the recent activity request returns a failed response
            const fetchMock = jest.fn().mockResolvedValue(makeResponse(false));
            const auth = makeAuth(fetchMock);

            // Then requesting recent activity should throw an error
            await expect(getRecentActivity(auth)).rejects.toThrow();
        });
    });
});
