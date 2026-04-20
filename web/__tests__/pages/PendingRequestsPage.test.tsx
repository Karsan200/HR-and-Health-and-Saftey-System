import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { PendingRequestsPage } from "../../src/pages/PendingRequestsPage";
import { useAuth } from "../../src/AuthContext";
import {
    fetchPendingLeave,
    approveLeaveRequest,
    declineLeaveRequest,
    formatDateRange,
    formatRequestedOn,
} from "../../src/logic/PendingRequestsService";
import { fetchLeaveTypes } from "../../src/logic/LeaveTypeService";
import { fetchReportedClockInCount } from "../../src/logic/ClockOverridesService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/PendingRequestsService");
jest.mock("../../src/logic/LeaveTypeService");
jest.mock("../../src/logic/ClockOverridesService", () => ({
    fetchReportedClockInCount: jest.fn(),
}));

jest.mock("../../src/components/SectionNavbar", () => ({
    SectionNavBar: ({ tabs }: { tabs: { label: string; count?: number }[] }) => (
        <div data-testid="section-nav">
            {tabs.map(t => (
                <span key={t.label} data-testid="nav-tab">
                    {t.label}
                    {t.count !== undefined && (
                        <span data-testid="nav-badge">{t.count}</span>
                    )}
                </span>
            ))}
        </div>
    ),
}));

const mockUseAuth           = useAuth as jest.Mock;
const mockFetchPendingLeave = fetchPendingLeave as jest.Mock;
const mockApproveLeave      = approveLeaveRequest as jest.Mock;
const mockDeclineLeave      = declineLeaveRequest as jest.Mock;
const mockFetchLeaveTypes   = fetchLeaveTypes as jest.Mock;
const mockFetchReportedCount = fetchReportedClockInCount as jest.Mock;
const mockFormatDateRange   = formatDateRange as jest.Mock;
const mockFormatRequestedOn = formatRequestedOn as jest.Mock;

const mockAuthService = { fetch: jest.fn() };

// ── Fixtures ──────────────────────────────────────────────────────────────────

const requestOne = {
    leaveId: 1,
    employeeName: "John Doe",
    leaveType: "Holiday",
    startDate: "2026-06-01T08:00:00",
    endDate: "2026-06-05T17:00:00",
    notes: "Summer holiday",
    created: "2026-05-01T10:00:00",
};

const requestTwo = {
    leaveId: 2,
    employeeName: "Jane Smith",
    leaveType: "Sick Leave",
    startDate: "2026-05-10T08:00:00",
    endDate: "2026-05-10T17:00:00",
    notes: null,
    created: "2026-05-10T09:00:00",
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockFetchPendingLeave.mockResolvedValue([]);
    mockFetchLeaveTypes.mockResolvedValue([]);
    mockFetchReportedCount.mockResolvedValue(0);
    mockApproveLeave.mockResolvedValue(undefined);
    mockDeclineLeave.mockResolvedValue(undefined);
    mockFormatDateRange.mockImplementation(
        (start: string, end: string) => `${start} – ${end}`
    );
    mockFormatRequestedOn.mockImplementation(
        (created: string) => `Requested on ${created}`
    );
});

// Renders and waits for all on-mount fetches to settle inside act()
async function renderPage() {
    let result: ReturnType<typeof render>;
    await act(async () => {
        result = render(
            <MemoryRouter initialEntries={["/calendar/requests"]}>
                <PendingRequestsPage />
            </MemoryRouter>
        );
    });
    return result!;
}

// Returns the nav-badge element scoped to the tab with the given label
function getBadgeInTab(tabLabel: string) {
    const tab = screen.getAllByTestId("nav-tab").find(t => t.textContent?.includes(tabLabel));
    return tab?.querySelector('[data-testid="nav-badge"]');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PendingRequestsPage", () => {

    describe("initial render", () => {
        it("calls fetchPendingLeave on mount", async () => {
            await renderPage();
            expect(mockFetchPendingLeave).toHaveBeenCalledTimes(1);
        });

        it("calls fetchLeaveTypes on mount", async () => {
            await renderPage();
            expect(mockFetchLeaveTypes).toHaveBeenCalledTimes(1);
        });

        it("passes the auth service to fetchPendingLeave", async () => {
            await renderPage();
            expect(mockFetchPendingLeave).toHaveBeenCalledWith(mockAuthService);
        });

        it("passes the auth service to fetchLeaveTypes", async () => {
            await renderPage();
            expect(mockFetchLeaveTypes).toHaveBeenCalledWith(mockAuthService);
        });

        it("renders the section nav bar", async () => {
            await renderPage();
            expect(screen.getByTestId("section-nav")).toBeInTheDocument();
        });
    });

    describe("loading state", () => {
        it("shows a loading spinner while requests are being fetched", () => {
            mockFetchPendingLeave.mockReturnValueOnce(new Promise(() => {}));
            render(
                <MemoryRouter initialEntries={["/calendar/requests"]}>
                    <PendingRequestsPage />
                </MemoryRouter>
            );
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("hides the loading spinner after data has loaded", async () => {
            await renderPage();
            expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
        });
    });

    describe("error state", () => {
        it("shows an error message when the fetch fails", async () => {
            mockFetchPendingLeave.mockRejectedValueOnce(new Error("Network error"));
            await renderPage();
            expect(screen.getByText(/failed to load pending requests/i)).toBeInTheDocument();
        });

        it("does not show the spinner after a failed fetch", async () => {
            mockFetchPendingLeave.mockRejectedValueOnce(new Error("Network error"));
            await renderPage();
            expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
        });
    });

    describe("empty state", () => {
        it("shows the empty message when there are no pending requests", async () => {
            await renderPage();
            expect(screen.getByText("No pending requests")).toBeInTheDocument();
        });

        it("does not show the empty message when there are requests", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            expect(screen.queryByText("No pending requests")).not.toBeInTheDocument();
        });
    });

    describe("request card rendering", () => {
        it("renders the employee name", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        it("renders the leave type label", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            expect(screen.getByText("Holiday")).toBeInTheDocument();
        });

        it("renders the formatted date range", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            expect(mockFormatDateRange).toHaveBeenCalledWith(
                requestOne.startDate,
                requestOne.endDate
            );
        });

        it("renders the formatted requested-on date", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            expect(mockFormatRequestedOn).toHaveBeenCalledWith(requestOne.created);
        });

        it("renders multiple request cards", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne, requestTwo]);
            await renderPage();
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        });

        it("renders an Approve button for each card", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne, requestTwo]);
            await renderPage();
            expect(screen.getAllByText("Approve")).toHaveLength(2);
        });

        it("renders a Decline button for each card", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne, requestTwo]);
            await renderPage();
            expect(screen.getAllByText("Decline")).toHaveLength(2);
        });
    });

    describe("nav badge count", () => {
        it("shows the correct count in the nav badge", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne, requestTwo]);
            await renderPage();
            expect(getBadgeInTab("Pending Requests")).toHaveTextContent("2");
        });

        it("shows zero in the badge when there are no requests", async () => {
            await renderPage();
            expect(getBadgeInTab("Pending Requests")).toHaveTextContent("0");
        });
    });

    describe("approve action", () => {
        it("calls approveLeaveRequest with the correct id and reason", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();

            const reasonBox = screen.getByPlaceholderText(/add a note or reason/i);
            await userEvent.type(reasonBox, "Approved — enjoy!");
            await userEvent.click(screen.getByText("Approve"));

            await waitFor(() =>
                expect(mockApproveLeave).toHaveBeenCalledWith(
                    requestOne.leaveId,
                    "Approved — enjoy!",
                    mockAuthService
                )
            );
        });

        it("removes the card from the list after a successful approve", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            await userEvent.click(screen.getByText("Approve"));
            await waitFor(() =>
                expect(screen.queryByText("John Doe")).not.toBeInTheDocument()
            );
        });

        it("decrements the nav badge count after a successful approve", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            expect(getBadgeInTab("Pending Requests")).toHaveTextContent("1");
            await userEvent.click(screen.getByText("Approve"));
            await waitFor(() =>
                expect(getBadgeInTab("Pending Requests")).toHaveTextContent("0")
            );
        });

        it("shows an error message when approveLeaveRequest rejects", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            mockApproveLeave.mockRejectedValueOnce(new Error("Server error"));
            await renderPage();
            await userEvent.click(screen.getByText("Approve"));
            expect(await screen.findByText("Server error")).toBeInTheDocument();
        });

        it("keeps the card visible when approveLeaveRequest rejects", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            mockApproveLeave.mockRejectedValueOnce(new Error("Server error"));
            await renderPage();
            await userEvent.click(screen.getByText("Approve"));
            await waitFor(() =>
                expect(screen.getByText("Server error")).toBeInTheDocument()
            );
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        it("disables both buttons while a submission is in flight", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            mockApproveLeave.mockReturnValueOnce(new Promise(() => {}));
            await renderPage();
            await userEvent.click(screen.getByText("Approve"));
            const buttons = screen.getAllByRole("button");
            const actionButtons = buttons.filter(b =>
                b.textContent?.includes("Approve") || b.textContent?.includes("Decline")
            );
            actionButtons.forEach(b => expect(b).toBeDisabled());
        });
    });

    describe("decline action", () => {
        it("calls declineLeaveRequest with the correct id and reason", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();

            const reasonBox = screen.getByPlaceholderText(/add a note or reason/i);
            await userEvent.type(reasonBox, "Too busy");
            await userEvent.click(screen.getByText("Decline"));

            await waitFor(() =>
                expect(mockDeclineLeave).toHaveBeenCalledWith(
                    requestOne.leaveId,
                    "Too busy",
                    mockAuthService
                )
            );
        });

        it("removes the card from the list after a successful decline", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            await userEvent.click(screen.getByText("Decline"));
            await waitFor(() =>
                expect(screen.queryByText("John Doe")).not.toBeInTheDocument()
            );
        });

        it("decrements the nav badge count after a successful decline", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            await renderPage();
            expect(getBadgeInTab("Pending Requests")).toHaveTextContent("1");
            await userEvent.click(screen.getByText("Decline"));
            await waitFor(() =>
                expect(getBadgeInTab("Pending Requests")).toHaveTextContent("0")
            );
        });

        it("shows an error message when declineLeaveRequest rejects", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            mockDeclineLeave.mockRejectedValueOnce(new Error("Decline failed"));
            await renderPage();
            await userEvent.click(screen.getByText("Decline"));
            expect(await screen.findByText("Decline failed")).toBeInTheDocument();
        });

        it("keeps the card visible when declineLeaveRequest rejects", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne]);
            mockDeclineLeave.mockRejectedValueOnce(new Error("Decline failed"));
            await renderPage();
            await userEvent.click(screen.getByText("Decline"));
            await waitFor(() =>
                expect(screen.getByText("Decline failed")).toBeInTheDocument()
            );
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });

    describe("independent card error state", () => {
        it("only shows the error on the card that failed, not others", async () => {
            mockFetchPendingLeave.mockResolvedValueOnce([requestOne, requestTwo]);
            mockApproveLeave.mockRejectedValueOnce(new Error("Only this one failed"));
            await renderPage();
            const approveButtons = screen.getAllByText("Approve");
            await userEvent.click(approveButtons[0]);
            await waitFor(() =>
                expect(screen.getByText("Only this one failed")).toBeInTheDocument()
            );
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        });
    });
});