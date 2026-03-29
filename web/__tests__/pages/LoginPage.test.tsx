import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginPage } from "../../src/pages/auth/LoginPage";
import { useAuth } from "../../src/AuthContext";
import { HttpException } from "../../src/models/HttpException";

jest.mock("../../src/AuthContext");

const mockLogin = jest.fn();

const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
        authenticationService: {
            login: mockLogin,
        },
    });
});

function renderLoginPage() {
    return render(<LoginPage />);
}

function getUsername() {
    return screen.getByLabelText(/username/i);
}

function getPassword() {
    return screen.getByLabelText(/password/i);
}

function getLoginButton() {
    return screen.getByRole("button", { name: /login/i });
}

describe("LoginPage", () => {

    describe("initial render", () => {
        it("renders the Rent-A-Tech logo", () => {
            renderLoginPage();
            const logo = screen.getByAltText(/rent-a-tech/i);
            expect(logo).toBeInTheDocument();
        });

        it("renders username and password fields", () => {
            renderLoginPage();
            expect(getUsername()).toBeInTheDocument();
            expect(getPassword()).toBeInTheDocument();
        });

        it("renders the login button", () => {
            renderLoginPage();
            expect(getLoginButton()).toBeInTheDocument();
        });

        it("does not show an error alert on initial render", () => {
            renderLoginPage();
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });

        it("password field is masked by default", () => {
            renderLoginPage();
            expect(getPassword()).toHaveAttribute("type", "password");
        });
    });

    describe("password visibility toggle", () => {
        it("reveals password when the toggle icon is clicked", async () => {
            renderLoginPage();
            const toggle = screen.getByRole("button", { name: "" }); // IconButton has no label
            await userEvent.click(toggle);
            expect(getPassword()).toHaveAttribute("type", "text");
        });

        it("re-masks password when the toggle is clicked again", async () => {
            renderLoginPage();
            const toggle = screen.getByRole("button", { name: "" });
            await userEvent.click(toggle);
            await userEvent.click(toggle);
            expect(getPassword()).toHaveAttribute("type", "password");
        });
    });

    describe("client-side validation", () => {
        it("shows an error when both fields are empty", async () => {
            renderLoginPage();
            await userEvent.click(getLoginButton());
            expect(await screen.findByRole("alert")).toBeVisible();
            expect(screen.getByRole("alert")).toHaveTextContent(
                /please enter both username and password/i
            );
        });

        it("shows an error when only the username is filled", async () => {
            renderLoginPage();
            await userEvent.type(getUsername(), "tom");
            await userEvent.click(getLoginButton());
            expect(await screen.findByRole("alert")).toBeVisible();
        });

        it("shows an error when only the password is filled", async () => {
            renderLoginPage();
            await userEvent.type(getPassword(), "secret");
            await userEvent.click(getLoginButton());
            expect(await screen.findByRole("alert")).toBeVisible();
        });

        it("does not call login when validation fails", async () => {
            renderLoginPage();
            await userEvent.click(getLoginButton());
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it("shows an error when username is only whitespace", async () => {
            renderLoginPage();
            await userEvent.type(getUsername(), "   ");
            await userEvent.type(getPassword(), "secret");
            await userEvent.click(getLoginButton());
            expect(await screen.findByRole("alert")).toBeVisible();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe("successful login", () => {
        it("calls login with the correct credentials", async () => {
            mockLogin.mockResolvedValueOnce(undefined);
            renderLoginPage();

            await userEvent.type(getUsername(), "tom");
            await userEvent.type(getPassword(), "correct-password");
            await userEvent.click(getLoginButton());

            await waitFor(() =>
                expect(mockLogin).toHaveBeenCalledWith("tom", "correct-password")
            );
        });

        it("does not display an error alert on success", async () => {
            mockLogin.mockResolvedValueOnce(undefined);
            renderLoginPage();

            await userEvent.type(getUsername(), "tom");
            await userEvent.type(getPassword(), "correct-password");
            await userEvent.click(getLoginButton());

            await waitFor(() => expect(mockLogin).toHaveBeenCalled());
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("API error handling", () => {
        it("shows 'Invalid username or password' for a 401", async () => {
            mockLogin.mockRejectedValueOnce(new HttpException(401, "Unauthorized"));
            renderLoginPage();

            await userEvent.type(getUsername(), "tom");
            await userEvent.type(getPassword(), "wrong");
            await userEvent.click(getLoginButton());

            expect(await screen.findByRole("alert")).toHaveTextContent(
                /invalid username or password/i
            );
        });

        it("shows 'No user exists' for a 404", async () => {
            mockLogin.mockRejectedValueOnce(new HttpException(404, "Not Found"));
            renderLoginPage();

            await userEvent.type(getUsername(), "ghost");
            await userEvent.type(getPassword(), "secret");
            await userEvent.click(getLoginButton());

            expect(await screen.findByRole("alert")).toHaveTextContent(
                /no user exists with the provided username/i
            );
        });

        it("shows a generic error for unexpected status codes", async () => {
            mockLogin.mockRejectedValueOnce(new HttpException(500, "Server Error"));
            renderLoginPage();

            await userEvent.type(getUsername(), "tom");
            await userEvent.type(getPassword(), "secret");
            await userEvent.click(getLoginButton());

            expect(await screen.findByRole("alert")).toHaveTextContent(
                /an error occurred/i
            );
        });

        it("does not show an error alert for non-HttpException errors", async () => {
            mockLogin.mockRejectedValueOnce(new Error("Network failure"));
            renderLoginPage();

            await userEvent.type(getUsername(), "tom");
            await userEvent.type(getPassword(), "secret");
            await userEvent.click(getLoginButton());

            await waitFor(() => expect(mockLogin).toHaveBeenCalled());
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("loading state", () => {
        it("disables the login button while the request is in-flight", async () => {
            // Never resolves during this test, so the button stays in loading state
            mockLogin.mockReturnValueOnce(new Promise(() => {}));
            renderLoginPage();

            await userEvent.type(getUsername(), "tom");
            await userEvent.type(getPassword(), "secret");
            await userEvent.click(getLoginButton());

            await waitFor(() =>
                expect(getLoginButton()).toBeDisabled()
            );
        });

        it("re-enables the button after a failed request", async () => {
            mockLogin.mockRejectedValueOnce(new HttpException(401, "Unauthorized"));
            renderLoginPage();

            await userEvent.type(getUsername(), "tom");
            await userEvent.type(getPassword(), "wrong");
            await userEvent.click(getLoginButton());

            await waitFor(() =>
                expect(getLoginButton()).not.toBeDisabled()
            );
        });
    });
});