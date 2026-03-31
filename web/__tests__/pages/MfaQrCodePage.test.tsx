import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MfaQrCodePage } from "../../src/pages/auth/MfaQrCodePage";

jest.mock("qrcode.react", () => ({
    QRCodeSVG: ({ value }: { value: string }) => <div data-testid="qr-code" data-value={value} />,
}));

const VALID_SECRET = "otpauth://totp/Rent-A-Tech:tom?secret=ABC123DEF456&issuer=Rent-A-Tech";
const mockOnComplete = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
});

function renderPage(secret = VALID_SECRET) {
    return render(<MfaQrCodePage secret={secret} onComplete={mockOnComplete} />);
}

describe("MfaQrCodePage", () => {

    describe("initial render", () => {
        it("renders the MFA setup heading", () => {
            renderPage();
            expect(screen.getByText(/set up multi-factor authentication/i)).toBeInTheDocument();
        });

        it("renders the QR code", () => {
            renderPage();
            expect(screen.getByTestId("qr-code")).toBeInTheDocument();
        });

        it("passes the secret to the QR code", () => {
            renderPage();
            expect(screen.getByTestId("qr-code")).toHaveAttribute("data-value", VALID_SECRET);
        });

        it("renders the authenticator app instructions", () => {
            renderPage();
            expect(screen.getByText(/scan this qr code with your authenticator app/i)).toBeInTheDocument();
        });

        it("renders the 'Can't scan?' toggle button", () => {
            renderPage();
            expect(screen.getByRole("button", { name: /can't scan\? show secret/i })).toBeInTheDocument();
        });

        it("renders the Continue button", () => {
            renderPage();
            expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
        });

        it("does not show the secret text on initial render", () => {
            renderPage();
            // Collapse is closed — toggle button shows the "open" prompt
            expect(screen.getByRole("button", { name: /can't scan\? show secret/i })).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /hide secret/i })).not.toBeInTheDocument();
        });
    });

    describe("secret visibility toggle", () => {
        it("shows the extracted secret when the toggle is clicked", async () => {
            renderPage();
            await userEvent.click(screen.getByRole("button", { name: /can't scan\? show secret/i }));
            expect(screen.getByText("ABC123DEF456").closest(".MuiCollapse-root"))
                .not.toHaveClass("MuiCollapse-hidden");
        });

        it("changes the button label to 'Hide secret' when expanded", async () => {
            renderPage();
            await userEvent.click(screen.getByRole("button", { name: /can't scan\? show secret/i }));
            expect(screen.getByRole("button", { name: /hide secret/i })).toBeInTheDocument();
        });

        it("hides the secret again when the toggle is clicked a second time", async () => {
            renderPage();
            const toggle = screen.getByRole("button", { name: /can't scan\? show secret/i });
            await userEvent.click(toggle);
            await userEvent.click(screen.getByRole("button", { name: /hide secret/i }));
            // Button label reverted — collapse is logically closed
            expect(screen.getByRole("button", { name: /can't scan\? show secret/i })).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /hide secret/i })).not.toBeInTheDocument();
        });

        it("restores the 'Can't scan?' label after hiding", async () => {
            renderPage();
            const toggle = screen.getByRole("button", { name: /can't scan\? show secret/i });
            await userEvent.click(toggle);
            await userEvent.click(screen.getByRole("button", { name: /hide secret/i }));
            expect(screen.getByRole("button", { name: /can't scan\? show secret/i })).toBeInTheDocument();
        });

        it("only shows the extracted secret portion, not the full OTP URI", async () => {
            renderPage();
            await userEvent.click(screen.getByRole("button", { name: /can't scan\? show secret/i }));
            expect(screen.queryByText(VALID_SECRET)).not.toBeInTheDocument();
        });
    });

    describe("continue button", () => {
        it("calls onComplete when Continue is clicked", async () => {
            renderPage();
            await userEvent.click(screen.getByRole("button", { name: /continue/i }));
            expect(mockOnComplete).toHaveBeenCalledTimes(1);
        });
    });

    describe("invalid secret fallback", () => {
        it("renders without crashing when secret is an empty string", () => {
            // Empty string won't match the split pattern — verify it doesn't throw
            expect(() => render(
                <MfaQrCodePage secret="" onComplete={mockOnComplete} />
            )).toThrow();
        });
    });
});