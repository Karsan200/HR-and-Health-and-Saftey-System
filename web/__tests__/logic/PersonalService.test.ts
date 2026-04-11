import { fetchProfileData, fetchPersonalData, } from "../../src/logic/PersonalService";
import type { AuthenticationService } from "../../src/logic/AuthenticationService.ts";

const mockFetch = jest.fn();

const mockAuthService: jest.Mocked<AuthenticationService> = {
    fetch: mockFetch,
    auth: {} as never,
    refresh: jest.fn(),
    mfaTotp: jest.fn(),
    login: jest.fn(),
};

beforeEach(() => { jest.clearAllMocks(); });

function makeMockResponse<T>(ok: boolean, data: T) {
    return {
        ok,
        json: jest.fn().mockResolvedValue(data),
    };
}

describe("fetchProfileData", () => {

    it("calls the correct endpoint with GET method", async () => {
        mockFetch.mockResolvedValueOnce(makeMockResponse(true, {}));

        await fetchProfileData(mockAuthService);

        expect(mockFetch).toHaveBeenCalledWith(
            "/api/profile/me",
            { method: "GET" }
        );
    });

    it("returns profile data when response is ok", async () => {
        const mockProfile = {
            firstName: "Craig",
            lastName: "Sheppard",
            email: "craig@test.com",
            phoneNumber: "123456789",
            created: "2024-01-01",
        };

        mockFetch.mockResolvedValueOnce(makeMockResponse(true, mockProfile));

        const result = await fetchProfileData(mockAuthService);

        expect(result).toEqual(mockProfile);
    });

    it("throws an error when response is not ok", async () => {
        mockFetch.mockResolvedValueOnce(makeMockResponse(false, {}));

        await expect(fetchProfileData(mockAuthService))
            .rejects.toThrow("Failed to fetch profile");
    });
});

describe("fetchPersonalData", () => {

    it("calls both profile and settings endpoints", async () => {
        mockFetch
            .mockResolvedValueOnce(makeMockResponse(true, {})) // profile
            .mockResolvedValueOnce(makeMockResponse(true, {})); // settings

        await fetchPersonalData(mockAuthService);

        expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/profile/me", { method: "GET" });
        expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/settings", { method: "GET" });
    });

    it("returns combined profile and settings data", async () => {
        const mockProfile = {
            firstName: "Craig",
            lastName: "Sheppard",
            email: "craig@test.com",
            phoneNumber: "123456789",
            created: "2024-01-01",
        };

        const mockSettings = {
            silentStart: "22:00",
            silentEnd: "07:00",
        };

        mockFetch
            .mockResolvedValueOnce(makeMockResponse(true, mockProfile))
            .mockResolvedValueOnce(makeMockResponse(true, mockSettings));

        const result = await fetchPersonalData(mockAuthService);

        expect(result).toEqual({
            profile: mockProfile,
            settings: mockSettings,
        });
    });

    it("throws if profile fetch fails", async () => {
        mockFetch
            .mockResolvedValueOnce(makeMockResponse(false, {})) // profile fails
            .mockResolvedValueOnce(makeMockResponse(true, {})); // settings (won’t matter)

        await expect(fetchPersonalData(mockAuthService))
            .rejects.toThrow("Failed to fetch profile");
    });

    it("throws if settings fetch fails", async () => {
        mockFetch
            .mockResolvedValueOnce(makeMockResponse(true, {}))  // profile ok
            .mockResolvedValueOnce(makeMockResponse(false, {})); // settings fails

        await expect(fetchPersonalData(mockAuthService))
            .rejects.toThrow("Failed to fetch settings");
    });

    it("throws if fetch rejects (network error)", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        await expect(fetchPersonalData(mockAuthService))
            .rejects.toThrow("Network error");
    });
});