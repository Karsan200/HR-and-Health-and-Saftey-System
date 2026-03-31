import { AuthenticationService } from "../../src/logic/AuthenticationService";
import { AppSettings } from "../../src/AppSettings";
import type { AuthType } from "../../src/models/AuthType";

function makeAuth(overrides: Partial<AuthType> = {}): AuthType {
    return {
        accessToken: "initial-token",
        setAccessToken: jest.fn(),
        setIsAuthenticated: jest.fn(),
        setIsMfaAuthenticated: jest.fn(),
        ...overrides,
    } as unknown as AuthType;
}

function makeResponse(status: number, body: unknown = {}): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? "OK" : "Error",
        json: jest.fn().mockResolvedValue(body),
    } as unknown as Response;
}

beforeEach(() => {
    global.fetch = jest.fn();
    AppSettings.API_URL = "https://api.test.com";
});

afterEach(() => {
    jest.resetAllMocks();
});

describe("AuthenticationService.fetch", () => {
    it("attaches the Bearer token to the Authorization header", async () => {
        const auth = makeAuth({ accessToken: "my-token" });
        const svc = new AuthenticationService(auth);
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200));

        await svc.fetch("/some/endpoint");

        expect(fetch).toHaveBeenCalledWith(
            "https://api.test.com/some/endpoint",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer my-token",
                }),
            })
        );
    });

    it("returns the response on success", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200, { data: "ok" }));

        const response = await svc.fetch("/some/endpoint");

        expect(response.status).toBe(200);
    });

    it("merges caller-supplied headers with the Authorization header", async () => {
        const svc = new AuthenticationService(makeAuth({ accessToken: "tok" }));
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200));

        await svc.fetch("/endpoint", { headers: { "Content-Type": "application/json" } });

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Content-Type": "application/json",
                    Authorization: "Bearer tok",
                }),
            })
        );
    });

    it("attempts a token refresh on a 401 response", async () => {
        const auth = makeAuth();
        const svc = new AuthenticationService(auth);

        // First call: 401 — second call (after refresh): 200
        (fetch as jest.Mock)
            .mockResolvedValueOnce(makeResponse(401))                           // original request
            .mockResolvedValueOnce(makeResponse(200, { accessToken: "new" }))  // refresh call
            .mockResolvedValueOnce(makeResponse(200));                          // retried request

        await svc.fetch("/protected");

        // fetch should have been called 3 times total
        expect(fetch).toHaveBeenCalledTimes(3);
    });

    it("updates the access token after a successful refresh", async () => {
        const auth = makeAuth();
        const svc = new AuthenticationService(auth);

        (fetch as jest.Mock)
            .mockResolvedValueOnce(makeResponse(401))
            .mockResolvedValueOnce(makeResponse(200, { accessToken: "refreshed-token" }))
            .mockResolvedValueOnce(makeResponse(200));

        await svc.fetch("/protected");

        expect(auth.setAccessToken).toHaveBeenCalledWith("refreshed-token");
    });

    it("clears auth state when still 401 after refresh", async () => {
        const auth = makeAuth();
        const svc = new AuthenticationService(auth);

        (fetch as jest.Mock)
            .mockResolvedValueOnce(makeResponse(401))                           // original request
            .mockResolvedValueOnce(makeResponse(200, { accessToken: "new" }))  // refresh call
            .mockResolvedValueOnce(makeResponse(401));                          // retried request still 401

        await svc.fetch("/protected");

        expect(auth.setIsAuthenticated).toHaveBeenCalledWith(false);
        expect(auth.setIsMfaAuthenticated).toHaveBeenCalledWith(false);
        expect(auth.setAccessToken).toHaveBeenCalledWith(null);
    });

    it("does not retry more than once on 401", async () => {
        const auth = makeAuth();
        const svc = new AuthenticationService(auth);

        (fetch as jest.Mock)
            .mockResolvedValueOnce(makeResponse(401))
            .mockResolvedValueOnce(makeResponse(200, { accessToken: "new" }))
            .mockResolvedValueOnce(makeResponse(401));

        await svc.fetch("/protected");

        // 3 calls: original + refresh + retry. No further retries.
        expect(fetch).toHaveBeenCalledTimes(3);
    });
});

describe("AuthenticationService.refresh", () => {
    it("calls the refresh endpoint with credentials included", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200, { accessToken: "new-token" }));

        await svc.refresh();

        expect(fetch).toHaveBeenCalledWith(
            "https://api.test.com/auth/refresh",
            expect.objectContaining({
                method: "GET",
                credentials: "include",
            })
        );
    });

    it("updates the access token on success", async () => {
        const auth = makeAuth();
        const svc = new AuthenticationService(auth);
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200, { accessToken: "new-token" }));

        await svc.refresh();

        expect(auth.setAccessToken).toHaveBeenCalledWith("new-token");
        expect(auth.accessToken).toBe("new-token");
    });

    it("throws HttpException on a failed refresh", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(401));

        await expect(svc.refresh()).rejects.toThrow();
    });

    it("throws HttpException with the correct status on failure", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(500));

        await expect(svc.refresh()).rejects.toHaveProperty("statusCode", 500);
    });
});

describe("AuthenticationService.mfaTotp", () => {
    it("posts the TOTP code to the MFA endpoint", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200, { accessToken: "mfa-token" }));

        await svc.mfaTotp("123456");

        expect(fetch).toHaveBeenCalledWith(
            "https://api.test.com/auth/mfa/authorise",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ code: "123456" }),
            })
        );
    });

    it("updates the access token and sets MFA authenticated on success", async () => {
        const auth = makeAuth();
        const svc = new AuthenticationService(auth);
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200, { accessToken: "mfa-token" }));

        await svc.mfaTotp("123456");

        expect(auth.setAccessToken).toHaveBeenCalledWith("mfa-token");
        expect(auth.setIsMfaAuthenticated).toHaveBeenCalledWith(true);
    });

    it("throws HttpException on a failed MFA verification", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(401));

        await expect(svc.mfaTotp("wrong")).rejects.toThrow();
    });

    it("throws HttpException with the correct status on failure", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(403));

        await expect(svc.mfaTotp("wrong")).rejects.toHaveProperty("statusCode", 403);
    });
});

describe("AuthenticationService.login", () => {
    it("posts credentials to the login endpoint", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200, { accessToken: "login-token" }));

        await svc.login("tom", "password123");

        expect(fetch).toHaveBeenCalledWith(
            "https://api.test.com/auth/login",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ username: "tom", password: "password123", isMobile: false }),
                credentials: "include",
            })
        );
    });

    it("updates token and sets authenticated on success", async () => {
        const auth = makeAuth();
        const svc = new AuthenticationService(auth);
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200, { accessToken: "login-token" }));

        await svc.login("tom", "password123");

        expect(auth.setAccessToken).toHaveBeenCalledWith("login-token");
        expect(auth.setIsAuthenticated).toHaveBeenCalledWith(true);
    });

    it("sets MFA authenticated to false after login", async () => {
        const auth = makeAuth();
        const svc = new AuthenticationService(auth);
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(200, { accessToken: "login-token" }));

        await svc.login("tom", "password123");

        expect(auth.setIsMfaAuthenticated).toHaveBeenCalledWith(false);
    });

    it("throws HttpException on invalid credentials", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(401));

        await expect(svc.login("tom", "wrong")).rejects.toThrow();
    });

    it("throws HttpException with the correct status on failure", async () => {
        const svc = new AuthenticationService(makeAuth());
        (fetch as jest.Mock).mockResolvedValueOnce(makeResponse(401));

        await expect(svc.login("tom", "wrong")).rejects.toHaveProperty("statusCode", 401);
    });
});