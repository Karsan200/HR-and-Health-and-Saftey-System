import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../src/AuthContext";
import { AuthenticationService } from "../src/logic/AuthenticationService";

jest.mock("../src/logic/AuthenticationService");
jest.mock("../src/pages/auth/LoginPage", () => ({
    LoginPage: () => <div data-testid="login-page" />,
}));
jest.mock("../src/pages/auth/MfaTotpPage", () => ({
    MfaTotpPage: () => <div data-testid="mfa-totp-page" />,
}));
jest.mock("../src/pages/auth/MfaQrCodePage", () => ({
    MfaQrCodePage: ({ onComplete }: { onComplete: () => void }) => (
        <div data-testid="mfa-qr-code-page">
            <button onClick={onComplete}>Complete</button>
        </div>
    ),
}));
jest.mock("../src/components/ActivityLoader", () => ({
    ActivityLoader: () => <div data-testid="activity-loader" />,
}));

const MockAuthService = AuthenticationService as jest.MockedClass<typeof AuthenticationService>;

function renderAuthProvider(
    isAuthenticated: boolean | null,
    setIsAuthenticated: jest.Mock,
    isMfaAuthenticated: boolean | null,
    setIsMfaAuthenticated: jest.Mock,
) {
    return render(
        <AuthProvider
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            isMfaAuthenticated={isMfaAuthenticated}
            setIsMfaAuthenticated={setIsMfaAuthenticated}
        >
            <div data-testid="app-content" />
        </AuthProvider>
    );
}

describe("AuthProvider", () => {
    let mockRefresh: jest.Mock;
    let mockFetch: jest.Mock;
    let setIsAuthenticated: jest.Mock;
    let setIsMfaAuthenticated: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRefresh = jest.fn();
        mockFetch = jest.fn();

        MockAuthService.mockImplementation(() => ({
            refresh: mockRefresh,
            fetch: mockFetch,
            login: jest.fn(),
            mfaTotp: jest.fn(),
        } as unknown as AuthenticationService));

        setIsAuthenticated = jest.fn();
        setIsMfaAuthenticated = jest.fn();
    });

    describe("loading state", () => {
        it("shows ActivityLoader while isAuthenticated is null", () => {
            mockRefresh.mockReturnValue(new Promise(() => {}));
            renderAuthProvider(null, setIsAuthenticated, null, setIsMfaAuthenticated);
            expect(screen.getByTestId("activity-loader")).toBeInTheDocument();
        });
    });

    describe("unauthenticated", () => {
        it("shows LoginPage when isAuthenticated is false", () => {
            mockRefresh.mockResolvedValue(undefined);
            renderAuthProvider(false, setIsAuthenticated, null, setIsMfaAuthenticated);
            expect(screen.getByTestId("login-page")).toBeInTheDocument();
        });

        it("calls setIsAuthenticated(false) when refresh fails", async () => {
            mockRefresh.mockRejectedValue(new Error("Unauthorized"));
            renderAuthProvider(null, setIsAuthenticated, null, setIsMfaAuthenticated);
            await waitFor(() =>
                expect(setIsAuthenticated).toHaveBeenCalledWith(false)
            );
        });

        it("calls setIsAuthenticated(true) when refresh succeeds", async () => {
            mockRefresh.mockResolvedValue(undefined);
            renderAuthProvider(null, setIsAuthenticated, null, setIsMfaAuthenticated);
            await waitFor(() =>
                expect(setIsAuthenticated).toHaveBeenCalledWith(true)
            );
        });
    });

    describe("MFA QR code setup", () => {
        it("shows MfaQrCodePage when authenticated and a secret is returned", async () => {
            mockRefresh.mockResolvedValue(undefined);
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    mfaAuthorised: false,
                    secret: "ABC123",
                    username: "tom",
                }),
            });

            renderAuthProvider(true, setIsAuthenticated, false, setIsMfaAuthenticated);

            await waitFor(() =>
                expect(screen.getByTestId("mfa-qr-code-page")).toBeInTheDocument()
            );
        });

        it("clears the QR page and shows children when onComplete is called", async () => {
            // This requires local state mutation via onComplete — tested via the mock button
            mockRefresh.mockResolvedValue(undefined);
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    mfaAuthorised: false,
                    secret: "ABC123",
                    username: "tom",
                }),
            });

            const { getByRole, getByTestId, queryByTestId } = render(
                <AuthProvider
                    isAuthenticated={true}
                    setIsAuthenticated={setIsAuthenticated}
                    isMfaAuthenticated={false}
                    setIsMfaAuthenticated={setIsMfaAuthenticated}
                >
                    <div data-testid="app-content" />
                </AuthProvider>
            );

            await waitFor(() => expect(getByTestId("mfa-qr-code-page")).toBeInTheDocument());

            getByRole("button", { name: /complete/i }).click();

            await waitFor(() => expect(queryByTestId("mfa-qr-code-page")).not.toBeInTheDocument());
        });
    });

    describe("MFA TOTP verification", () => {
        it("shows MfaTotpPage when authenticated, no secret, and MFA not yet authorised", async () => {
            mockRefresh.mockResolvedValue(undefined);
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    mfaAuthorised: false,
                    secret: null,
                    username: "tom",
                }),
            });

            renderAuthProvider(true, setIsAuthenticated, false, setIsMfaAuthenticated);

            await waitFor(() =>
                expect(screen.getByTestId("mfa-totp-page")).toBeInTheDocument()
            );
        });
    });

    describe("fully authenticated", () => {
        it("renders children when authenticated and MFA is authorised", async () => {
            mockRefresh.mockResolvedValue(undefined);
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    mfaAuthorised: true,
                    secret: null,
                    username: "tom",
                }),
            });

            renderAuthProvider(true, setIsAuthenticated, true, setIsMfaAuthenticated);

            await waitFor(() =>
                expect(screen.getByTestId("app-content")).toBeInTheDocument()
            );
        });

        it("calls setIsMfaAuthenticated with the value from the MFA check", async () => {
            mockRefresh.mockResolvedValue(undefined);
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    mfaAuthorised: true,
                    secret: null,
                    username: "tom",
                }),
            });

            renderAuthProvider(true, setIsAuthenticated, null, setIsMfaAuthenticated);

            await waitFor(() =>
                expect(setIsMfaAuthenticated).toHaveBeenCalledWith(true)
            );
        });

        it("calls setIsMfaAuthenticated(false) when the MFA check response is not ok", async () => {
            mockRefresh.mockResolvedValue(undefined);
            mockFetch.mockResolvedValue({ ok: false });

            renderAuthProvider(true, setIsAuthenticated, null, setIsMfaAuthenticated);

            await waitFor(() =>
                expect(setIsMfaAuthenticated).toHaveBeenCalledWith(false)
            );
        });
    });

    describe("useAuth", () => {
        it("throws when used outside of AuthProvider", () => {
            const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
            function BadComponent() {
                useAuth();
                return null;
            }
            expect(() => render(<BadComponent />)).toThrow(
                "useAuth must be used inside an AuthProvider"
            );
            consoleError.mockRestore();
        });
    });
});
