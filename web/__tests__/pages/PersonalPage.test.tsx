import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { PersonalPage } from "../../src/pages/PersonalPage";
import { useAuth } from "../../src/AuthContext";
import { fetchPersonalData, updateNotificationSettings } from "../../src/logic/PersonalService";
import { changePassword } from "../../src/logic/PersonalSecurityService";


jest.mock("../../src/logic/PersonalSecurityService", () => ({
    changePassword: jest.fn(),
}));

jest.mock("../../src/logic/PersonalService", () => ({
    fetchPersonalData: jest.fn(),
    updateNotificationSettings: jest.fn(),
}));

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/PersonalService");

const mockUseAuth = useAuth as jest.Mock;
const mockFetchPersonalData = fetchPersonalData as jest.Mock;
const mockChangePassword = changePassword as jest.Mock;
const mockUpdateNotificationSettings = updateNotificationSettings as jest.Mock;

const mockAuthService = { getToken: jest.fn() };

const mockProfile = {
    firstName: "Craig",
    lastName: "Sheppard",
    email: "craig@rentatech.wales",
    phoneNumber: "555-555-555",
    created: "15 March 2013",
};

const mockSettings = {
    silentStart: null,
    silentEnd: null,
    largeText: false,
    dyslexicFont: false,
    highlightText: false,
    textToSpeech: false,
    dictation: false,
    themePreset: "DEFAULT",
    accentColour: "#D20414",
    textColour: "#000000",
    backgroundColour: "#F6F6F8",
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockFetchPersonalData.mockResolvedValue({
        profile: mockProfile,
        settings: mockSettings,
    });
    mockUpdateNotificationSettings.mockResolvedValue(undefined);
});

function renderPersonalPage() {
    return render(
        <MemoryRouter initialEntries={["/personal"]}>
            <PersonalPage />
        </MemoryRouter>
    );
}

describe("PersonalPage", () => {

    // Initial rendering Tests

    describe("initial render", () => {
        it("renders the user's full name in the header", async () => {
            renderPersonalPage();
            expect(await screen.findByText("Craig Sheppard")).toBeInTheDocument();
        });

        it("renders the user's email in the header", async () => {
            renderPersonalPage();
            expect(await screen.findByText("craig@rentatech.wales")).toBeInTheDocument();
        });

        it("renders all three tabs", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            expect(screen.getByText("Profile Information")).toBeInTheDocument();
            expect(screen.getByText("Settings")).toBeInTheDocument();
            expect(screen.getByText("Security")).toBeInTheDocument();
        });

        it("renders the profile tab content by default", async () => {
            renderPersonalPage();
            expect(await screen.findByText("Personal Details")).toBeInTheDocument();
            expect(screen.getByText("Employee Details")).toBeInTheDocument();
        });

        it("calls fetchPersonalData on mount", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(mockFetchPersonalData).toHaveBeenCalledTimes(1)
            );
        });

        it("calls fetchPersonalData with the auth service", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(mockFetchPersonalData).toHaveBeenCalledWith(mockAuthService)
            );
        });
    });

    // Loading state

    describe("loading state", () => {
        it("shows a loading spinner while data is being fetched", () => {
            mockFetchPersonalData.mockReturnValueOnce(new Promise(() => {}));
            renderPersonalPage();
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("hides the loading spinner after data has loaded", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
        });

        it("does not render profile content while loading", () => {
            mockFetchPersonalData.mockReturnValueOnce(new Promise(() => {}));
            renderPersonalPage();
            expect(screen.queryByText("Personal Details")).not.toBeInTheDocument();
        });
    });

    // Error state

    describe("error state", () => {
        it("shows an error message when the fetch fails", async () => {
            mockFetchPersonalData.mockRejectedValueOnce(new Error("Network error"));
            renderPersonalPage();
            expect(
                await screen.findByText("Failed to load profile. Please try again.")
            ).toBeInTheDocument();
        });

        it("does not show profile content when there is an error", async () => {
            mockFetchPersonalData.mockRejectedValueOnce(new Error("Network error"));
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByText("Personal Details")).not.toBeInTheDocument()
            );
        });

        it("does not show a loading spinner after a failed fetch", async () => {
            mockFetchPersonalData.mockRejectedValueOnce(new Error("Network error"));
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
        });
    });

    // Profile tab content

    describe("profile tab", () => {
        it("renders the user's email in the personal details section", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.getByText("​craig@rentatech.wales")).toBeInTheDocument()
            );
        });

        it("renders the user's phone number in the personal details section", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.getByText("555-555-555")).toBeInTheDocument()
            );
        });

        it("renders the user's full name in the employee details section", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.getByText("Craig ​Sheppard")).toBeInTheDocument()
            );
        });

        it("renders the user's join date in the employee details section", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.getByText("15 March 2013")).toBeInTheDocument()
            );
        });

        it("does not render the notifications section when silentStart and silentEnd are null", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByText("Notifications")).not.toBeInTheDocument()
            );
        });

        it("renders the notifications section when silent times are set", async () => {
            mockFetchPersonalData.mockResolvedValueOnce({
                profile: mockProfile,
                settings: { ...mockSettings, silentStart: "17:00", silentEnd: "06:00" },
            });
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.getByText("Notifications")).toBeInTheDocument()
            );
            expect(
                screen.getByText("Notifications silenced between 17:00 and 06:00")
            ).toBeInTheDocument();
        });
    });

    describe("security tab", () => {

        async function openSecurityTab() {
            renderPersonalPage();

            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );

            await userEvent.click(screen.getByText("Security"));
        }

        beforeEach(() => {
            mockChangePassword.mockResolvedValue(undefined);
        });

        it("renders the change password form", async () => {
            await openSecurityTab();

            expect(screen.getByText("Change Password")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("New Password")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Confirm New Password")).toBeInTheDocument();
            expect(screen.getByText("Submit Change")).toBeInTheDocument();
        });

        it("shows error when fields are empty", async () => {
            await openSecurityTab();

            await userEvent.click(screen.getByText("Submit Change"));

            expect(
                screen.getByText("Please fill in all fields.")
            ).toBeInTheDocument();
        });

        it("shows error when passwords do not match", async () => {
            await openSecurityTab();

            await userEvent.type(screen.getByPlaceholderText("Password"), "oldPass123");
            await userEvent.type(screen.getByPlaceholderText("New Password"), "newPass123");
            await userEvent.type(screen.getByPlaceholderText("Confirm New Password"), "wrongPass");

            await userEvent.click(screen.getByText("Submit Change"));

            expect(
                screen.getByText("New passwords do not match.")
            ).toBeInTheDocument();
        });

        it("shows error when new password equals old password", async () => {
            await openSecurityTab();

            await userEvent.type(screen.getByPlaceholderText("Password"), "samePass123");
            await userEvent.type(screen.getByPlaceholderText("New Password"), "samePass123");
            await userEvent.type(screen.getByPlaceholderText("Confirm New Password"), "samePass123");

            await userEvent.click(screen.getByText("Submit Change"));

            expect(
                screen.getByText("New password must be different to old password.")
            ).toBeInTheDocument();
        });

        it("shows error when password is too short", async () => {
            await openSecurityTab();

            await userEvent.type(screen.getByPlaceholderText("Password"), "oldPass123");
            await userEvent.type(screen.getByPlaceholderText("New Password"), "short");
            await userEvent.type(screen.getByPlaceholderText("Confirm New Password"), "short");

            await userEvent.click(screen.getByText("Submit Change"));

            expect(
                screen.getByText("Password must be at least 8 characters.")
            ).toBeInTheDocument();
        });

        it("calls changePassword with correct payload on valid submit", async () => {
            await openSecurityTab();

            await userEvent.type(screen.getByPlaceholderText("Password"), "oldPass123");
            await userEvent.type(screen.getByPlaceholderText("New Password"), "newPass123");
            await userEvent.type(screen.getByPlaceholderText("Confirm New Password"), "newPass123");

            await userEvent.click(screen.getByText("Submit Change"));

            await waitFor(() =>
                expect(mockChangePassword).toHaveBeenCalledWith(
                    mockAuthService,
                    {
                        oldPassword: "oldPass123",
                        newPassword: "newPass123",
                        confirmNewPassword: "newPass123",
                    }
                )
            );
        });

        it("shows success message on successful password change", async () => {
            await openSecurityTab();

            await userEvent.type(screen.getByPlaceholderText("Password"), "oldPass123");
            await userEvent.type(screen.getByPlaceholderText("New Password"), "newPass123");
            await userEvent.type(screen.getByPlaceholderText("Confirm New Password"), "newPass123");

            await userEvent.click(screen.getByText("Submit Change"));

            expect(
                await screen.findByText("Password changed successfully.")
            ).toBeInTheDocument();
        });

        it("shows error message when API call fails", async () => {
            mockChangePassword.mockRejectedValueOnce(new Error("fail"));

            await openSecurityTab();

            await userEvent.type(screen.getByPlaceholderText("Password"), "oldPass123");
            await userEvent.type(screen.getByPlaceholderText("New Password"), "newPass123");
            await userEvent.type(screen.getByPlaceholderText("Confirm New Password"), "newPass123");

            await userEvent.click(screen.getByText("Submit Change"));

            expect(
                await screen.findByText("Failed to change password. Please try again.")
            ).toBeInTheDocument();
        });
    });

    describe("settings tab", () => {

        async function openSettingsTab() {
            renderPersonalPage();

            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );

            await userEvent.click(screen.getByText("Settings"));
        }

        beforeEach(() => {
            mockFetchPersonalData.mockResolvedValue({
                profile: mockProfile,
                settings: mockSettings,
            });
        });

        // Initial render

        it("renders the Notification Settings title", async () => {
            await openSettingsTab();
            expect(screen.getByText("Notification Settings")).toBeInTheDocument();
        });

        it("renders the NOTIFICATION QUIET TIME label", async () => {
            await openSettingsTab();
            expect(screen.getByText("NOTIFICATION QUIET TIME")).toBeInTheDocument();
        });

        it("renders the set start time step by default", async () => {
            await openSettingsTab();
            expect(screen.getByText("Set start time")).toBeInTheDocument();
        });

        it("renders the SET START TIME button on the first step", async () => {
            await openSettingsTab();
            expect(screen.getByText("SET START TIME")).toBeInTheDocument();
        });

        it("renders the CANCEL button on the first step", async () => {
            await openSettingsTab();
            expect(screen.getByText("CANCEL")).toBeInTheDocument();
        });

        // Step navigation

        it("advances to the set end time step when SET START TIME is clicked", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            expect(screen.getByText("Set end time")).toBeInTheDocument();
        });

        it("renders the SET END TIME button on the second step", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            expect(screen.getByText("SET END TIME")).toBeInTheDocument();
        });

        it("renders the BACK button on the set end time step", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            expect(screen.getByText("BACK")).toBeInTheDocument();
        });

        it("goes back to set start time step when BACK is clicked on the end time step", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("BACK"));
            expect(screen.getByText("Set start time")).toBeInTheDocument();
        });

        it("advances to the confirm step when SET END TIME is clicked", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("SET END TIME"));
            expect(screen.getByText("Confirm quiet hours")).toBeInTheDocument();
        });

        it("renders the OK button on the confirm step", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("SET END TIME"));
            expect(screen.getByText("OK")).toBeInTheDocument();
        });

        it("renders the BACK button on the confirm step", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("SET END TIME"));
            expect(screen.getByText("BACK")).toBeInTheDocument();
        });

        it("goes back to the set end time step when BACK is clicked on the confirm step", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("SET END TIME"));
            await userEvent.click(screen.getByText("BACK"));
            expect(screen.getByText("Set end time")).toBeInTheDocument();
        });

        it("resets to the start time step when CANCEL is clicked", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("BACK"));
            await userEvent.click(screen.getByText("CANCEL"));
            expect(screen.getByText("Set start time")).toBeInTheDocument();
        });

        // Submission

        it("calls updateNotificationSettings with correct payload on valid submit", async () => {
            const { updateNotificationSettings } = await import("../../src/logic/PersonalService");
            const mockUpdate = updateNotificationSettings as jest.Mock;
            mockUpdate.mockResolvedValueOnce(undefined);

            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("SET END TIME"));
            await userEvent.click(screen.getByText("OK"));

            await waitFor(() =>
                expect(mockUpdate).toHaveBeenCalledWith(
                    mockAuthService,
                    expect.objectContaining({
                        silentStart: expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
                        silentEnd: expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
                    })
                )
            );
        });

        it("shows success message after a successful save", async () => {
            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("SET END TIME"));
            await userEvent.click(screen.getByText("OK"));

            await waitFor(() =>
                expect(screen.getByText("Notification settings saved.")).toBeInTheDocument()
            );
        });

        it("returns to the start step after a successful save", async () => {
            const { updateNotificationSettings } = await import("../../src/logic/PersonalService");
            (updateNotificationSettings as jest.Mock).mockResolvedValueOnce(undefined);

            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("SET END TIME"));
            await userEvent.click(screen.getByText("OK"));

            await waitFor(() =>
                expect(screen.getByText("Set start time")).toBeInTheDocument()
            );
        });

        it("shows error message when the API call fails", async () => {
            const { updateNotificationSettings } = await import("../../src/logic/PersonalService");
            (updateNotificationSettings as jest.Mock).mockRejectedValueOnce(new Error("fail"));

            await openSettingsTab();
            await userEvent.click(screen.getByText("SET START TIME"));
            await userEvent.click(screen.getByText("SET END TIME"));
            await userEvent.click(screen.getByText("OK"));

            expect(
                await screen.findByText("Failed to save notification settings. Please try again.")
            ).toBeInTheDocument();
        });
    });

    // Tab navigation

    describe("tab navigation", () => {
        it("shows the settings placeholder when the Settings tab is clicked", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            await userEvent.click(screen.getByText("Settings"));
            expect(screen.getByText("Notification Settings")).toBeInTheDocument();
        });

        it("returns to the profile tab when Profile Information is clicked after switching", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            await userEvent.click(screen.getByText("Settings"));
            await userEvent.click(screen.getByText("Profile Information"));
            expect(screen.getByText("Personal Details")).toBeInTheDocument();
        });

        it("hides profile content when Settings tab is active", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            await userEvent.click(screen.getByText("Settings"));
            expect(screen.queryByText("Personal Details")).not.toBeInTheDocument();
        });

        it("hides profile content when Security tab is active", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            await userEvent.click(screen.getByText("Security"));
            expect(screen.queryByText("Personal Details")).not.toBeInTheDocument();
        });
    });
});