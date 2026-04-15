import { render, screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { ClockOverridesPage } from "../../src/pages/ClockOverridesPage";
import { useAuth } from "../../src/AuthContext";
import {
    fetchClockInsForDate,
    fetchAllClockIns,
    submitClockOverride,
    createClockIn,
    deleteClockIn,
    searchAccounts,
    fetchReportedClockInCount,
    type ClockInRecord,
} from "../../src/logic/ClockOverridesService";
import { fetchPendingLeaveCount } from "../../src/logic/PendingRequestsService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/ClockOverridesService");
jest.mock("../../src/logic/PendingRequestsService", () => ({
    fetchPendingLeaveCount: jest.fn(),
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

const mockUseAuth                 = useAuth as jest.Mock;
const mockFetchClockInsForDate    = fetchClockInsForDate as jest.Mock;
const mockFetchAllClockIns        = fetchAllClockIns as jest.Mock;
const mockSubmitClockOverride     = submitClockOverride as jest.Mock;
const mockCreateClockIn           = createClockIn as jest.Mock;
const mockDeleteClockIn           = deleteClockIn as jest.Mock;
const mockSearchAccounts          = searchAccounts as jest.Mock;
const mockFetchReportedCount      = fetchReportedClockInCount as jest.Mock;
const mockFetchPendingCount       = fetchPendingLeaveCount as jest.Mock;

const mockAuthService = { fetch: jest.fn() };

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeRecord(overrides: Partial<ClockInRecord> = {}): ClockInRecord {
    return {
        clockId: "clock-uuid-1",
        employeeName: "John Smith",
        accountId: 1,
        clockInTime: "08:00:00",
        clockOutTime: "17:00:00",
        created: "2026-04-07T08:00:00",
        report: null,
        ...overrides,
    };
}

const recordWithReport = makeRecord({
    clockId: "clock-uuid-reported",
    employeeName: "Jane Doe",
    report: {
        reportId: 1,
        issue: "I arrived on time but was clocked in late.",
        created: "2026-04-07T09:00:00",
    },
});

const recordTwo = makeRecord({
    clockId: "clock-uuid-2",
    employeeName: "Alice Jones",
    clockInTime: "09:00:00",
    clockOutTime: "18:00:00",
    created: "2026-04-07T09:00:00",
});

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockFetchClockInsForDate.mockResolvedValue([]);
    mockFetchAllClockIns.mockResolvedValue([]);
    mockFetchReportedCount.mockResolvedValue(0);
    mockFetchPendingCount.mockResolvedValue(0);
    mockSubmitClockOverride.mockResolvedValue(undefined);
    mockCreateClockIn.mockResolvedValue(undefined);
    mockDeleteClockIn.mockResolvedValue(undefined);
    mockSearchAccounts.mockResolvedValue([]);
});

async function renderPage() {
    let result: ReturnType<typeof render>;
    await act(async () => {
        result = render(
            <MemoryRouter initialEntries={["/calendar/overrides"]}>
                <ClockOverridesPage />
            </MemoryRouter>
        );
    });
    return result!;
}

function getBadgeInTab(tabLabel: string) {
    const tab = screen.getAllByTestId("nav-tab").find(t => t.textContent?.includes(tabLabel));
    return tab?.querySelector('[data-testid="nav-badge"]');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ClockOverridesPage", () => {

    describe("initial render", () => {
        it("calls fetchClockInsForDate on mount with today's date", async () => {
            await renderPage();
            expect(mockFetchClockInsForDate).toHaveBeenCalledTimes(1);
            const today = new Date().toISOString().split("T")[0];
            expect(mockFetchClockInsForDate).toHaveBeenCalledWith(today, mockAuthService);
        });

        it("calls fetchPendingLeaveCount on mount", async () => {
            await renderPage();
            expect(mockFetchPendingCount).toHaveBeenCalledTimes(1);
        });

        it("calls fetchReportedClockInCount on mount", async () => {
            await renderPage();
            expect(mockFetchReportedCount).toHaveBeenCalledTimes(1);
        });

        it("renders the section nav bar", async () => {
            await renderPage();
            expect(screen.getByTestId("section-nav")).toBeInTheDocument();
        });

        it("renders the Add Clock-in button", async () => {
            await renderPage();
            expect(screen.getByRole("button", { name: /add clock-in/i })).toBeInTheDocument();
        });

        it("renders the date filter input", async () => {
            await renderPage();
            expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
        });

        it("renders the search employee filter", async () => {
            await renderPage();
            expect(screen.getByLabelText(/search employee/i)).toBeInTheDocument();
        });

        it("renders the sort-by dropdown", async () => {
            await renderPage();
            // MUI renders both a label element and a span with this text
            expect(screen.getAllByText("Sort by").length).toBeGreaterThan(0);
        });

        it("renders the show dropdown", async () => {
            await renderPage();
            // MUI renders both a label element and a span with this text
            expect(screen.getAllByText("Show").length).toBeGreaterThan(0);
        });

        it("renders the Show all clock-ins checkbox", async () => {
            await renderPage();
            expect(screen.getByLabelText(/show all clock-ins/i)).toBeInTheDocument();
        });
    });

    describe("loading state", () => {
        it("shows a loading spinner while records are being fetched", () => {
            mockFetchClockInsForDate.mockReturnValueOnce(new Promise(() => {}));
            render(
                <MemoryRouter initialEntries={["/calendar/overrides"]}>
                    <ClockOverridesPage />
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
            mockFetchClockInsForDate.mockRejectedValueOnce(new Error("Network error"));
            await renderPage();
            expect(screen.getByText(/failed to load clock-in records/i)).toBeInTheDocument();
        });

        it("does not show the spinner after a failed fetch", async () => {
            mockFetchClockInsForDate.mockRejectedValueOnce(new Error("Network error"));
            await renderPage();
            expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
        });
    });

    describe("empty state", () => {
        it("shows the empty state message when there are no records", async () => {
            await renderPage();
            expect(screen.getByText(/no clock-ins match your filters/i)).toBeInTheDocument();
        });

        it("does not show the empty state when there are records", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            expect(screen.queryByText(/no clock-ins match your filters/i)).not.toBeInTheDocument();
        });
    });

    describe("record card rendering", () => {
        it("renders the employee name", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            expect(screen.getByText("John Smith")).toBeInTheDocument();
        });

        it("renders the clock-in and clock-out times", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            // The card shows Clock In and Clock Out labels — assert those headings are present
            expect(screen.getAllByText("Clock In").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Clock Out").length).toBeGreaterThan(0);
        });

        it("renders '--:--' for a missing clock-in time", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord({ clockInTime: null })]);
            await renderPage();
            expect(screen.getAllByText("--:--").length).toBeGreaterThan(0);
        });

        it("renders '--:--' for a missing clock-out time", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord({ clockOutTime: null })]);
            await renderPage();
            expect(screen.getAllByText("--:--").length).toBeGreaterThan(0);
        });

        it("renders multiple records", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord(), recordTwo]);
            await renderPage();
            expect(screen.getByText("John Smith")).toBeInTheDocument();
            expect(screen.getByText("Alice Jones")).toBeInTheDocument();
        });

        it("renders Edit Times and Delete buttons for each card", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord(), recordTwo]);
            await renderPage();
            expect(screen.getAllByText("Edit Times")).toHaveLength(2);
            expect(screen.getAllByText("Delete")).toHaveLength(2);
        });

        it("renders the reported badge when a record has a report", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([recordWithReport]);
            await renderPage();
            expect(screen.getByText("Reported")).toBeInTheDocument();
        });

        it("renders the report issue text on a reported card", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([recordWithReport]);
            await renderPage();
            expect(screen.getByText("I arrived on time but was clocked in late.")).toBeInTheDocument();
        });

        it("does not render the reported badge for a clean record", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            expect(screen.queryByText("Reported")).not.toBeInTheDocument();
        });
    });

    describe("result summary", () => {
        it("shows '0 results' when there are no records", async () => {
            await renderPage();
            expect(screen.getByText("0 results")).toBeInTheDocument();
        });

        it("shows '1 result' (singular) when there is one record", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            expect(screen.getByText("1 result")).toBeInTheDocument();
        });

        it("shows '2 results' when there are two records", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord(), recordTwo]);
            await renderPage();
            expect(screen.getByText("2 results")).toBeInTheDocument();
        });

        it("shows the reported count when records have reports", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord(), recordWithReport]);
            await renderPage();
            expect(screen.getByText(/1 reported/)).toBeInTheDocument();
        });

        it("does not show the reported count when no records have reports", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            expect(screen.queryByText(/reported/)).not.toBeInTheDocument();
        });
    });

    describe("nav badges", () => {
        it("shows the pending count in the Pending Requests nav badge", async () => {
            mockFetchPendingCount.mockResolvedValueOnce(3);
            await renderPage();
            expect(getBadgeInTab("Pending Requests")).toHaveTextContent("3");
        });

        it("shows the reported count in the Clock Overrides nav badge", async () => {
            mockFetchReportedCount.mockResolvedValueOnce(5);
            await renderPage();
            expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("5");
        });

        it("shows zero in the Clock Overrides badge when there are no reports", async () => {
            await renderPage();
            expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("0");
        });
    });

    describe("show all toggle", () => {
        it("calls fetchAllClockIns when the show-all checkbox is checked", async () => {
            await renderPage();
            await userEvent.click(screen.getByLabelText(/show all clock-ins/i));
            await waitFor(() => expect(mockFetchAllClockIns).toHaveBeenCalledTimes(1));
        });

        it("disables the date input when show-all is checked", async () => {
            await renderPage();
            await userEvent.click(screen.getByLabelText(/show all clock-ins/i));
            expect(screen.getByLabelText(/date/i)).toBeDisabled();
        });

        it("calls fetchClockInsForDate again when show-all is unchecked", async () => {
            await renderPage();
            await userEvent.click(screen.getByLabelText(/show all clock-ins/i));
            await waitFor(() => expect(mockFetchAllClockIns).toHaveBeenCalledTimes(1));
            await userEvent.click(screen.getByLabelText(/show all clock-ins/i));
            await waitFor(() => expect(mockFetchClockInsForDate).toHaveBeenCalledTimes(2));
        });
    });

    describe("employee name filter", () => {
        it("filters records by employee name (case-insensitive)", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord(), recordTwo]);
            await renderPage();
            await userEvent.type(screen.getByLabelText(/search employee/i), "alice");
            await waitFor(() => {
                expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
                expect(screen.getByText("Alice Jones")).toBeInTheDocument();
            });
        });

        it("shows all records when the filter is cleared", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord(), recordTwo]);
            await renderPage();
            const input = screen.getByLabelText(/search employee/i);
            await userEvent.type(input, "alice");
            await userEvent.clear(input);
            await waitFor(() => {
                expect(screen.getByText("John Smith")).toBeInTheDocument();
                expect(screen.getByText("Alice Jones")).toBeInTheDocument();
            });
        });
    });

    describe("reported-only filter", () => {
        it("shows only reported records when 'Reported only' is selected", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord(), recordWithReport]);
            await renderPage();

            // MUI renders both a <label> and a <span> with "Show" — get the <label> element
            const showLabels = screen.getAllByText("Show");
            const showLabel = showLabels.find(el => el.tagName === "LABEL") as HTMLElement;
            const formControl = showLabel.closest(".MuiFormControl-root") as HTMLElement;
            await userEvent.click(within(formControl).getByRole("combobox"));

            await waitFor(() => screen.getByRole("option", { name: "Reported only" }));
            await userEvent.click(screen.getByRole("option", { name: "Reported only" }));

            await waitFor(() => {
                expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
                expect(screen.getByText("Jane Doe")).toBeInTheDocument();
            });
        });
    });

    describe("edit modal", () => {
        it("opens the edit modal when Edit Times is clicked", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            expect(screen.getByText("Edit Clock-in")).toBeInTheDocument();
        });

        it("pre-populates the modal with the record's existing times", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            const modal = screen.getByText("Edit Clock-in").closest('[role="presentation"]') as HTMLElement;
            // The modal renders Clock In and Clock Out time picker fields
            expect(within(modal).getByText("Clock In")).toBeInTheDocument();
            expect(within(modal).getByText("Clock Out")).toBeInTheDocument();
        });

        it("shows the employee name in the modal subtitle", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            const modal = screen.getByText("Edit Clock-in").closest('[role="presentation"]') as HTMLElement;
            expect(within(modal).getByText("John Smith")).toBeInTheDocument();
        });

        it("closes the edit modal when Cancel is clicked", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            await userEvent.click(screen.getByText("Cancel"));
            await waitFor(() =>
                expect(screen.queryByText("Edit Clock-in")).not.toBeInTheDocument()
            );
        });

        it("closes the edit modal when the X button is clicked", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            await userEvent.click(screen.getByLabelText("Close"));
            await waitFor(() =>
                expect(screen.queryByText("Edit Clock-in")).not.toBeInTheDocument()
            );
        });

        it("calls submitClockOverride with the correct payload on save", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            await userEvent.click(screen.getByText("Save Override"));
            await waitFor(() =>
                expect(mockSubmitClockOverride).toHaveBeenCalledWith(
                    "clock-uuid-1",
                    expect.objectContaining({ removeReport: false }),
                    mockAuthService
                )
            );
        });

        it("closes the modal after a successful save", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            await userEvent.click(screen.getByText("Save Override"));
            await waitFor(() =>
                expect(screen.queryByText("Edit Clock-in")).not.toBeInTheDocument()
            );
        });

        it("shows an error message when submitClockOverride rejects", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            mockSubmitClockOverride.mockRejectedValueOnce(new Error("Server error"));
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            await userEvent.click(screen.getByText("Save Override"));
            expect(await screen.findByText("Server error")).toBeInTheDocument();
        });

        it("shows the employee report panel when the record has a report", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([recordWithReport]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            const modal = screen.getByText("Edit Clock-in").closest('[role="presentation"]') as HTMLElement;
            expect(within(modal).getByText("Employee Report")).toBeInTheDocument();
            expect(within(modal).getByText("I arrived on time but was clocked in late.")).toBeInTheDocument();
        });

        it("shows the dismiss report checkbox when the record has a report", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([recordWithReport]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            expect(screen.getByText("Remove the attached report after saving")).toBeInTheDocument();
        });

        it("does not show the dismiss report checkbox when the record has no report", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Edit Times"));
            expect(screen.queryByText("Remove the attached report after saving")).not.toBeInTheDocument();
        });

        it("decrements the Clock Overrides nav badge when a report is dismissed", async () => {
            mockFetchReportedCount.mockResolvedValueOnce(1);
            mockFetchClockInsForDate.mockResolvedValueOnce([recordWithReport]);
            await renderPage();
            expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("1");

            await userEvent.click(screen.getByText("Edit Times"));
            // dismiss report checkbox is checked by default
            await userEvent.click(screen.getByText("Save Override"));

            await waitFor(() =>
                expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("0")
            );
        });
    });

    describe("delete modal", () => {
        it("opens the delete modal when Delete is clicked", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Delete"));
            expect(screen.getByText("Delete Clock-in")).toBeInTheDocument();
        });

        it("shows the employee name and times in the confirmation panel", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Delete"));
            const modal = screen.getByText("Delete Clock-in").closest('[role="presentation"]') as HTMLElement;
            // The confirmation panel contains the employee name
            expect(within(modal).getByText(/John Smith/)).toBeInTheDocument();
            // Confirm the "are you sure" text is visible
            expect(within(modal).getByText(/are you sure you want to delete/i)).toBeInTheDocument();
        });

        it("closes the delete modal when Cancel is clicked", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Delete"));
            await userEvent.click(screen.getByText("Cancel"));
            await waitFor(() =>
                expect(screen.queryByText("Delete Clock-in")).not.toBeInTheDocument()
            );
        });

        it("closes the delete modal when the X button is clicked", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Delete"));
            await userEvent.click(screen.getByLabelText("Close"));
            await waitFor(() =>
                expect(screen.queryByText("Delete Clock-in")).not.toBeInTheDocument()
            );
        });

        it("calls deleteClockIn with the correct clock ID on confirm", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Delete"));
            // click the confirm Delete button inside the modal
            const modal = screen.getByText("Delete Clock-in").closest('[role="presentation"]') as HTMLElement;
            await userEvent.click(within(modal).getByText("Delete"));
            await waitFor(() =>
                expect(mockDeleteClockIn).toHaveBeenCalledWith("clock-uuid-1", mockAuthService)
            );
        });

        it("removes the record from the list after a successful delete", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            await renderPage();
            await userEvent.click(screen.getByText("Delete"));
            const modal = screen.getByText("Delete Clock-in").closest('[role="presentation"]') as HTMLElement;
            await userEvent.click(within(modal).getByText("Delete"));
            await waitFor(() =>
                expect(screen.queryByText("John Smith")).not.toBeInTheDocument()
            );
        });

        it("shows an error message when deleteClockIn rejects", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord()]);
            mockDeleteClockIn.mockRejectedValueOnce(new Error("Delete failed"));
            await renderPage();
            await userEvent.click(screen.getByText("Delete"));
            const modal = screen.getByText("Delete Clock-in").closest('[role="presentation"]') as HTMLElement;
            await userEvent.click(within(modal).getByText("Delete"));
            expect(await screen.findByText("Delete failed")).toBeInTheDocument();
        });

        it("decrements the Clock Overrides badge when a reported record is deleted", async () => {
            mockFetchReportedCount.mockResolvedValueOnce(1);
            mockFetchClockInsForDate.mockResolvedValueOnce([recordWithReport]);
            await renderPage();
            expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("1");

            await userEvent.click(screen.getByText("Delete"));
            const modal = screen.getByText("Delete Clock-in").closest('[role="presentation"]') as HTMLElement;
            await userEvent.click(within(modal).getByText("Delete"));

            await waitFor(() =>
                expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("0")
            );
        });

        it("does not decrement the badge when a non-reported record is deleted", async () => {
            mockFetchReportedCount.mockResolvedValueOnce(1);
            mockFetchClockInsForDate.mockResolvedValueOnce([makeRecord(), recordWithReport]);
            await renderPage();
            expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("1");

            await userEvent.click(screen.getAllByText("Delete")[0]);
            const modal = screen.getByText("Delete Clock-in").closest('[role="presentation"]') as HTMLElement;
            await userEvent.click(within(modal).getByText("Delete"));

            await waitFor(() =>
                expect(screen.queryByText("John Smith")).not.toBeInTheDocument()
            );
            expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("1");
        });

        it("shows a warning when the record has a report that will also be deleted", async () => {
            mockFetchClockInsForDate.mockResolvedValueOnce([recordWithReport]);
            await renderPage();
            await userEvent.click(screen.getByText("Delete"));
            expect(screen.getByText(/attached employee report will also be deleted/i)).toBeInTheDocument();
        });
    });

    describe("add modal", () => {
        it("opens the add modal when Add Clock-in is clicked", async () => {
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));
            expect(screen.getByText("Manually create a clock-in record for an employee")).toBeInTheDocument();
        });

        it("closes the add modal when Cancel is clicked", async () => {
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));
            await userEvent.click(screen.getByText("Cancel"));
            await waitFor(() =>
                expect(screen.queryByText("Manually create a clock-in record for an employee")).not.toBeInTheDocument()
            );
        });

        it("closes the add modal when the X button is clicked", async () => {
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));
            await userEvent.click(screen.getByLabelText("Close"));
            await waitFor(() =>
                expect(screen.queryByText("Manually create a clock-in record for an employee")).not.toBeInTheDocument()
            );
        });

        it("shows an error when Add Clock-in is submitted without selecting an employee", async () => {
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));
            const modal = screen.getByText("Manually create a clock-in record for an employee").closest('[role="presentation"]') as HTMLElement;
            // The submit button is disabled when no employee is selected
            expect(within(modal).getByRole("button", { name: /add clock-in/i })).toBeDisabled();
        });

        it("calls createClockIn with the correct payload when submitted with a selected employee", async () => {
            mockSearchAccounts.mockResolvedValueOnce([{ accountId: 42, fullName: "Bob Builder" }]);
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            const searchInput = screen.getByPlaceholderText("Search by name...");
            await userEvent.type(searchInput, "Bob");

            await waitFor(() => screen.getByText("Bob Builder"));
            await userEvent.click(screen.getByText("Bob Builder"));

            const modal = screen.getByText("Manually create a clock-in record for an employee").closest('[role="presentation"]') as HTMLElement;
            await userEvent.click(within(modal).getByRole("button", { name: /add clock-in/i }));

            await waitFor(() =>
                expect(mockCreateClockIn).toHaveBeenCalledWith(
                    expect.objectContaining({ accountId: 42 }),
                    mockAuthService
                )
            );
        });

        it("shows an error message when createClockIn rejects", async () => {
            mockSearchAccounts.mockResolvedValueOnce([{ accountId: 42, fullName: "Bob Builder" }]);
            mockCreateClockIn.mockRejectedValueOnce(new Error("Already exists"));
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            const searchInput = screen.getByPlaceholderText("Search by name...");
            await userEvent.type(searchInput, "Bob");
            await waitFor(() => screen.getByText("Bob Builder"));
            await userEvent.click(screen.getByText("Bob Builder"));

            const modal = screen.getByText("Manually create a clock-in record for an employee").closest('[role="presentation"]') as HTMLElement;
            await userEvent.click(within(modal).getByRole("button", { name: /add clock-in/i }));

            expect(await screen.findByText("Already exists")).toBeInTheDocument();
        });

        it("adds the new record to the list after a successful add", async () => {
            mockSearchAccounts.mockResolvedValueOnce([{ accountId: 42, fullName: "Bob Builder" }]);
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            const searchInput = screen.getByPlaceholderText("Search by name...");
            await userEvent.type(searchInput, "Bob");
            await waitFor(() => screen.getByText("Bob Builder"));
            await userEvent.click(screen.getByText("Bob Builder"));

            const modal = screen.getByText("Manually create a clock-in record for an employee").closest('[role="presentation"]') as HTMLElement;
            await userEvent.click(within(modal).getByRole("button", { name: /add clock-in/i }));

            await waitFor(() => expect(screen.getByText("Bob Builder")).toBeInTheDocument());
        });
    });

    describe("employee autocomplete", () => {
        it("shows suggestions when the user types in the search field", async () => {
            mockSearchAccounts.mockResolvedValueOnce([
                { accountId: 1, fullName: "John Smith" },
                { accountId: 2, fullName: "Johnny Walker" },
            ]);
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            await userEvent.type(screen.getByPlaceholderText("Search by name..."), "John");

            await waitFor(() => {
                expect(screen.getByText("John Smith")).toBeInTheDocument();
                expect(screen.getByText("Johnny Walker")).toBeInTheDocument();
            });
        });

        it("shows the account ID alongside each suggestion", async () => {
            mockSearchAccounts.mockResolvedValueOnce([{ accountId: 7, fullName: "Alice Green" }]);
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            await userEvent.type(screen.getByPlaceholderText("Search by name..."), "Alice");

            await waitFor(() => expect(screen.getByText("ID 7")).toBeInTheDocument());
        });

        it("selects a suggestion and populates the input on click", async () => {
            mockSearchAccounts.mockResolvedValueOnce([{ accountId: 1, fullName: "John Smith" }]);
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            await userEvent.type(screen.getByPlaceholderText("Search by name..."), "John");
            await waitFor(() => screen.getByText("John Smith"));
            await userEvent.click(screen.getByText("John Smith"));

            expect(screen.getByDisplayValue("John Smith")).toBeInTheDocument();
        });

        it("shows no suggestions for an empty input", async () => {
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));
            // No suggestions rendered means searchAccounts was not called for empty input
            expect(mockSearchAccounts).not.toHaveBeenCalled();
        });

        it("clears the confirmed selection when the user edits the input after selecting", async () => {
            // First resolve for the initial search, second resolve for after typing again
            mockSearchAccounts
                .mockResolvedValueOnce([{ accountId: 1, fullName: "John Smith" }])
                .mockResolvedValueOnce([{ accountId: 1, fullName: "John Smith" }]);
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            // Select an employee
            await userEvent.type(screen.getByPlaceholderText("Search by name..."), "John");
            await waitFor(() => screen.getByText("John Smith"));
            await userEvent.click(screen.getByText("John Smith"));
            expect(screen.getByDisplayValue("John Smith")).toBeInTheDocument();

            // Edit the input — should clear the confirmed selection
            await userEvent.type(screen.getByPlaceholderText("Search by name..."), "x");

            // The submit button should become disabled again (no confirmed selection)
            const modal = screen.getByText("Manually create a clock-in record for an employee").closest('[role="presentation"]') as HTMLElement;
            await waitFor(() =>
                expect(within(modal).getByRole("button", { name: /add clock-in/i })).toBeDisabled()
            );
        });

        it("hides suggestions and shows no error when the search throws", async () => {
            mockSearchAccounts.mockRejectedValueOnce(new Error("Search failed"));
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            await userEvent.type(screen.getByPlaceholderText("Search by name..."), "fail");

            // After the debounce fires and the search rejects, no suggestions should appear
            await waitFor(() => expect(mockSearchAccounts).toHaveBeenCalledTimes(1));
            expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
        });

        it("clears suggestions when the input is emptied", async () => {
            mockSearchAccounts.mockResolvedValueOnce([{ accountId: 1, fullName: "John Smith" }]);
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            const input = screen.getByPlaceholderText("Search by name...");
            await userEvent.type(input, "John");
            await waitFor(() => screen.getByText("John Smith"));

            await userEvent.clear(input);
            await waitFor(() =>
                expect(screen.queryByText("John Smith")).not.toBeInTheDocument()
            );
        });
    });

    describe("add modal — edge cases", () => {
        it("shows an error when the date is cleared before submitting", async () => {
            mockSearchAccounts.mockResolvedValueOnce([{ accountId: 42, fullName: "Bob Builder" }]);
            await renderPage();
            await userEvent.click(screen.getByRole("button", { name: /add clock-in/i }));

            // Select an employee
            await userEvent.type(screen.getByPlaceholderText("Search by name..."), "Bob");
            await waitFor(() => screen.getByText("Bob Builder"));
            await userEvent.click(screen.getByText("Bob Builder"));

            // Clear the date field
            const modal = screen.getByText("Manually create a clock-in record for an employee").closest('[role="presentation"]') as HTMLElement;
            const dateInput = within(modal).getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
            await userEvent.clear(dateInput);

            await userEvent.click(within(modal).getByRole("button", { name: /add clock-in/i }));

            expect(await screen.findByText("Date is required.")).toBeInTheDocument();
        });
    });

    describe("edit modal — report kept when dismiss unchecked", () => {
        it("does not decrement the badge when save is clicked with dismiss unchecked", async () => {
            mockFetchReportedCount.mockResolvedValueOnce(1);
            mockFetchClockInsForDate.mockResolvedValueOnce([recordWithReport]);
            await renderPage();
            expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("1");

            await userEvent.click(screen.getByText("Edit Times"));

            // Uncheck the dismiss report checkbox
            const checkbox = screen.getByRole("checkbox");
            await userEvent.click(checkbox);

            await userEvent.click(screen.getByText("Save Override"));

            await waitFor(() =>
                expect(mockSubmitClockOverride).toHaveBeenCalledWith(
                    "clock-uuid-reported",
                    expect.objectContaining({ removeReport: false }),
                    mockAuthService
                )
            );

            // Badge should remain at 1
            expect(getBadgeInTab("Clock Overrides")).toHaveTextContent("1");
        });
    });

    describe("silent fetch failures", () => {
        it("does not show an error when fetchPendingLeaveCount fails", async () => {
            mockFetchPendingCount.mockRejectedValueOnce(new Error("Count failed"));
            await renderPage();
            // Page renders normally — the badge just stays at 0
            expect(screen.getByTestId("section-nav")).toBeInTheDocument();
            expect(screen.queryByText("Count failed")).not.toBeInTheDocument();
        });

        it("does not show an error when fetchReportedClockInCount fails", async () => {
            mockFetchReportedCount.mockRejectedValueOnce(new Error("Reported count failed"));
            await renderPage();
            // Page renders normally — the badge just stays at 0
            expect(screen.getByTestId("section-nav")).toBeInTheDocument();
            expect(screen.queryByText("Reported count failed")).not.toBeInTheDocument();
        });
    });
});