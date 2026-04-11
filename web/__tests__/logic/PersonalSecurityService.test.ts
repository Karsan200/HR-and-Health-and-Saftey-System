import { changePassword, type ChangePasswordRequest } from "../../src/logic/PersonalSecurityService";
import type { AuthenticationService } from "../../src/logic/AuthenticationService";

describe("changePassword", () => {
    let mockFetch: jest.Mock;

    const mockAuthService = {
        fetch: jest.fn(),
    } as unknown as AuthenticationService;

    const validRequest: ChangePasswordRequest = {
        oldPassword: "oldPass123",
        newPassword: "newPass123",
        confirmNewPassword: "newPass123",
    };

    beforeEach(() => {
        mockFetch = jest.fn();
        (mockAuthService.fetch as jest.Mock) = mockFetch;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("calls API with correct endpoint, method and body", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
        });

        await changePassword(mockAuthService, validRequest);

        expect(mockFetch).toHaveBeenCalledWith("/api/profile/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validRequest),
        });
    });

    it("resolves without throwing when response is ok", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
        });

        await expect(
            changePassword(mockAuthService, validRequest)
        ).resolves.toBeUndefined();
    });

    it("throws backend error message when response is not ok", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            text: jest.fn().mockResolvedValue("Current password is incorrect"),
        });

        await expect(
            changePassword(mockAuthService, validRequest)
        ).rejects.toThrow("Current password is incorrect");
    });

    it("throws fallback error when backend returns empty message", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            text: jest.fn().mockResolvedValue(""),
        });

        await expect(
            changePassword(mockAuthService, validRequest)
        ).rejects.toThrow("Failed to change password");
    });

    it("throws fallback error when text() fails", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            text: jest.fn().mockRejectedValue(new Error("fail")),
        });

        await expect(
            changePassword(mockAuthService, validRequest)
        ).rejects.toThrow();
    });

    it("sends correct payload structure", async () => {
        mockFetch.mockResolvedValue({ ok: true });

        await changePassword(mockAuthService, validRequest);

        const callArgs = mockFetch.mock.calls[0][1];
        const parsedBody = JSON.parse(callArgs.body);

        expect(parsedBody).toEqual({
            oldPassword: "oldPass123",
            newPassword: "newPass123",
            confirmNewPassword: "newPass123",
        });
    });
});