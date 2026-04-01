import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MfaTotpPage } from "../../src/pages/auth/MfaTotpPage";
import { useAuth } from "../../src/AuthContext";
import { HttpException } from "../../src/models/HttpException";

jest.mock("../../src/AuthContext");

const mockMfaTotp = jest.fn();

const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
        authenticationService: {
            mfaTotp: mockMfaTotp,
        },
    });
});

function renderMfaTotpPage() {
    return render(<MfaTotpPage />);
}

function getTotpField() {
    return screen.getByLabelText(/mfa code/i);
}

function getVerifyButton() {
    return screen.getByRole("button", { name: /verify/i });
}

describe("MfaTotpPage", () => {

    describe("initial render", () => {
        it("renders the Rent-A-Tech logo", () => {
            renderMfaTotpPage();
            expect(screen.getByAltText(/rent-a-tech/i)).toBeInTheDocument();
        });

        it("renders the TOTP input field", () => {
            renderMfaTotpPage();
            expect(getTotpField()).toBeInTheDocument();
        });

        it("renders the helper text", () => {
            renderMfaTotpPage();
            expect(screen.getByText(/6-digit code from your authenticator app/i)).toBeInTheDocument();
        });

        it("renders the verify button", () => {
            renderMfaTotpPage();
            expect(getVerifyButton()).toBeInTheDocument();
        });

        it("does not show an error alert on initial render", () => {
            renderMfaTotpPage();
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("client-side validation", () => {
        it("shows an error when the field is empty", async () => {
            renderMfaTotpPage();
            await userEvent.click(getVerifyButton());
            expect(await screen.findByRole("alert")).toBeVisible();
            expect(screen.getByRole("alert")).toHaveTextContent(
                /please enter a valid 6-digit code/i
            );
        });

        it("shows an error when the code is fewer than 6 digits", async () => {
            renderMfaTotpPage();
            await userEvent.type(getTotpField(), "12345");
            await userEvent.click(getVerifyButton());
            expect(await screen.findByRole("alert")).toBeVisible();
        });

        it("shows an error when the code is more than 6 digits", async () => {
            renderMfaTotpPage();
            await userEvent.type(getTotpField(), "1234567");
            await userEvent.click(getVerifyButton());
            expect(await screen.findByRole("alert")).toBeVisible();
        });

        it("shows an error when the code contains non-numeric characters", async () => {
            renderMfaTotpPage();
            await userEvent.type(getTotpField(), "12345a");
            await userEvent.click(getVerifyButton());
            expect(await screen.findByRole("alert")).toBeVisible();
        });

        it("does not call mfaTotp when validation fails", async () => {
            renderMfaTotpPage();
            await userEvent.click(getVerifyButton());
            expect(mockMfaTotp).not.toHaveBeenCalled();
        });
    });

    describe("successful verification", () => {
        it("calls mfaTotp with the correct code", async () => {
            mockMfaTotp.mockResolvedValueOnce(undefined);
            renderMfaTotpPage();

            await userEvent.type(getTotpField(), "123456");
            await userEvent.click(getVerifyButton());

            await waitFor(() =>
                expect(mockMfaTotp).toHaveBeenCalledWith("123456")
            );
        });

        it("does not display an error alert on success", async () => {
            mockMfaTotp.mockResolvedValueOnce(undefined);
            renderMfaTotpPage();

            await userEvent.type(getTotpField(), "123456");
            await userEvent.click(getVerifyButton());

            await waitFor(() => expect(mockMfaTotp).toHaveBeenCalled());
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("API error handling", () => {
        it("shows 'Invalid or expired TOTP code' for a 403", async () => {
            mockMfaTotp.mockRejectedValueOnce(new HttpException(403, "Forbidden"));
            renderMfaTotpPage();

            await userEvent.type(getTotpField(), "123456");
            await userEvent.click(getVerifyButton());

            expect(await screen.findByRole("alert")).toHaveTextContent(
                /invalid or expired totp code/i
            );
        });

        it("shows a generic error for unexpected status codes", async () => {
            mockMfaTotp.mockRejectedValueOnce(new HttpException(500, "Server Error"));
            renderMfaTotpPage();

            await userEvent.type(getTotpField(), "123456");
            await userEvent.click(getVerifyButton());

            expect(await screen.findByRole("alert")).toHaveTextContent(
                /an error occurred/i
            );
        });

        it("does not show an error alert for non-HttpException errors", async () => {
            mockMfaTotp.mockRejectedValueOnce(new Error("Network failure"));
            renderMfaTotpPage();

            await userEvent.type(getTotpField(), "123456");
            await userEvent.click(getVerifyButton());

            await waitFor(() => expect(mockMfaTotp).toHaveBeenCalled());
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("loading state", () => {
        it("disables the verify button while the request is in-flight", async () => {
            mockMfaTotp.mockReturnValueOnce(new Promise(() => {}));
            renderMfaTotpPage();

            await userEvent.type(getTotpField(), "123456");
            await userEvent.click(getVerifyButton());

            await waitFor(() =>
                expect(getVerifyButton()).toBeDisabled()
            );
        });

        it("re-enables the button after a failed request", async () => {
            mockMfaTotp.mockRejectedValueOnce(new HttpException(403, "Forbidden"));
            renderMfaTotpPage();

            await userEvent.type(getTotpField(), "123456");
            await userEvent.click(getVerifyButton());

            await waitFor(() =>
                expect(getVerifyButton()).not.toBeDisabled()
            );
        });
    });
});