import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { NotificationPage } from "../../src/pages/NotificationPage";
import { useAuth } from "../../src/AuthContext";
import { getRecentActivity } from "../../src/logic/DashboardService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/DashboardService", () => ({
    getRecentActivity: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockGetRecentActivity = getRecentActivity as jest.Mock;

const mockAuthService = { getToken: jest.fn() };

const mockActivity = [
    {
        type: "DOCUMENT_SIGNED",
        message: "John Doe has signed Fire Safety Policy v2.0",
        created: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
    },
    {
        type: "LEAVE_REQUEST",
        message: "Maggie May has requested leave for the 1-3 March 2026",
        created: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90 minutes ago
    },
    {
        type: "LATE_CLOCK_IN",
        message: "Jane Doe clocked in 15 minutes late",
        created: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        type: "HAZARD_REPORTED",
        message: "A hazard was reported in the workshop",
        created: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
];

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockGetRecentActivity.mockResolvedValue(mockActivity);
});

function renderNotificationPage() {
    return render(
        <MemoryRouter>
            <NotificationPage />
        </MemoryRouter>
    );
}

describe("NotificationPage", () => {

    // Initial render

    describe("initial render", () => {
        it("renders the Notifications title", async () => {
            renderNotificationPage();
            expect(await screen.findByText("Notifications")).toBeInTheDocument();
        });

        it("renders the subtitle", async () => {
            renderNotificationPage();
            expect(
                await screen.findByText("Stay up to date with important system alerts")
            ).toBeInTheDocument();
        });

        it("renders the Mark all as read button", async () => {
            renderNotificationPage();
            expect(await screen.findByText("Mark all as read")).toBeInTheDocument();
        });

        it("renders the Recent Activity section header after data loads", async () => {
            renderNotificationPage();
            expect(await screen.findByText("Recent Activity")).toBeInTheDocument();
        });

        it("calls getRecentActivity on mount", async () => {
            renderNotificationPage();
            await waitFor(() =>
                expect(mockGetRecentActivity).toHaveBeenCalledTimes(1)
            );
        });

        it("calls getRecentActivity with the auth service", async () => {
            renderNotificationPage();
            await waitFor(() =>
                expect(mockGetRecentActivity).toHaveBeenCalledWith(mockAuthService)
            );
        });

        it("does not render the activity list before data has loaded", () => {
            mockGetRecentActivity.mockReturnValueOnce(new Promise(() => {}));
            renderNotificationPage();
            expect(screen.queryByText("Recent Activity")).not.toBeInTheDocument();
        });
    });

    // Notification cards

    describe("notification cards", () => {
        it("renders a card for each activity item", async () => {
            renderNotificationPage();
            await waitFor(() =>
                expect(screen.getByText("John Doe has signed Fire Safety Policy v2.0")).toBeInTheDocument()
            );
            expect(screen.getByText("Maggie May has requested leave for the 1-3 March 2026")).toBeInTheDocument();
            expect(screen.getByText("Jane Doe clocked in 15 minutes late")).toBeInTheDocument();
            expect(screen.getByText("A hazard was reported in the workshop")).toBeInTheDocument();
        });

        it("renders the correct label for DOCUMENT_SIGNED", async () => {
            renderNotificationPage();
            expect(await screen.findByText("Document Signed")).toBeInTheDocument();
        });

        it("renders the correct label for LEAVE_REQUEST", async () => {
            renderNotificationPage();
            expect(await screen.findByText("Requested Leave")).toBeInTheDocument();
        });

        it("renders the correct label for LATE_CLOCK_IN", async () => {
            renderNotificationPage();
            expect(await screen.findByText("Late Clock In")).toBeInTheDocument();
        });

        it("renders the correct label for HAZARD_REPORTED", async () => {
            renderNotificationPage();
            expect(await screen.findByText("Hazard Reported")).toBeInTheDocument();
        });

        it("renders an unknown type's raw type string as its label", async () => {
            mockGetRecentActivity.mockResolvedValueOnce([
                {
                    type: "UNKNOWN_TYPE",
                    message: "Something unexpected happened",
                    created: new Date().toISOString(),
                },
            ]);
            renderNotificationPage();
            expect(await screen.findByText("UNKNOWN_TYPE")).toBeInTheDocument();
        });

        it("renders an empty list without crashing when activity is empty", async () => {
            mockGetRecentActivity.mockResolvedValueOnce([]);
            renderNotificationPage();
            await waitFor(() =>
                expect(screen.getByText("Recent Activity")).toBeInTheDocument()
            );
            expect(screen.queryByText("Document Signed")).not.toBeInTheDocument();
        });

        it("renders an empty list when the service returns null", async () => {
            mockGetRecentActivity.mockResolvedValueOnce(null);
            renderNotificationPage();
            await waitFor(() =>
                expect(screen.getByText("Recent Activity")).toBeInTheDocument()
            );
            expect(screen.queryByText("Document Signed")).not.toBeInTheDocument();
        });
    });

    // Timestamps

    describe("timestamps", () => {
        it("renders a minutes ago timestamp for a recent item", async () => {
            mockGetRecentActivity.mockResolvedValueOnce([
                {
                    type: "LATE_CLOCK_IN",
                    message: "Someone was late",
                    created: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                },
            ]);
            renderNotificationPage();
            expect(await screen.findByText("30 minutes ago")).toBeInTheDocument();
        });

        it("renders an hours ago timestamp for an item from earlier today", async () => {
            mockGetRecentActivity.mockResolvedValueOnce([
                {
                    type: "LATE_CLOCK_IN",
                    message: "Someone was late",
                    created: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                },
            ]);
            renderNotificationPage();
            expect(await screen.findByText("2 hours ago")).toBeInTheDocument();
        });

        it("renders a singular day timestamp for an item from 1 day ago", async () => {
            mockGetRecentActivity.mockResolvedValueOnce([
                {
                    type: "DOCUMENT_SIGNED",
                    message: "Someone signed a doc",
                    created: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
                },
            ]);
            renderNotificationPage();
            expect(await screen.findByText("1 day ago")).toBeInTheDocument();
        });

        it("renders a plural days timestamp for an item from multiple days ago", async () => {
            mockGetRecentActivity.mockResolvedValueOnce([
                {
                    type: "DOCUMENT_SIGNED",
                    message: "Someone signed a doc",
                    created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
                },
            ]);
            renderNotificationPage();
            expect(await screen.findByText("3 days ago")).toBeInTheDocument();
        });
    });
});