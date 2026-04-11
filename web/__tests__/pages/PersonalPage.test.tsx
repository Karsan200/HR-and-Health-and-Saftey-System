import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { PersonalPage } from "../../src/pages/PersonalPage";
import { useAuth } from "../../src/AuthContext";
import { fetchPersonalData } from "../../src/logic/PersonalService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/PersonalService");

const mockUseAuth = useAuth as jest.Mock;
const mockFetchPersonalData = fetchPersonalData as jest.Mock;

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

    // Tab navigation
    // TODO: THESE TESTS WILL NEED TO BE REMOVED WHEN THE OTHER TABS ARE FILLED OUT!

    describe("tab navigation", () => {
        it("shows the settings placeholder when the Settings tab is clicked", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            await userEvent.click(screen.getByText("Settings"));
            expect(screen.getByText("Settings TBC")).toBeInTheDocument();
        });

        it("shows the security placeholder when the Security tab is clicked", async () => {
            renderPersonalPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            await userEvent.click(screen.getByText("Security"));
            expect(screen.getByText("Security TBC")).toBeInTheDocument();
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