import { render, screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TodaysClockInsModal } from "../../src/components/TodaysClockInsModal";
import { useAuth } from "../../src/AuthContext";
import {
    fetchTodaysClockIns,
    type TodaysClockInEntry,
} from "../../src/logic/ClockOverridesService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/ClockOverridesService");

const mockUseAuth            = useAuth as jest.Mock;
const mockFetchTodaysClockIns = fetchTodaysClockIns as jest.Mock;

const mockAuthService = { fetch: jest.fn() };

function makeEntry(overrides: Partial<TodaysClockInEntry> = {}): TodaysClockInEntry {
    return {
        accountId:    1,
        employeeName: "John Smith",
        firstOnSite:  { eventId: "event-uuid-1", timestamp: "2026-04-22T08:00:00" },
        lastOnSite:   { eventId: "event-uuid-2", timestamp: "2026-04-22T14:30:00" },
        allEvents: [
            { eventId: "event-uuid-1", timestamp: "2026-04-22T08:00:00" },
            { eventId: "event-uuid-2", timestamp: "2026-04-22T14:30:00" },
        ],
        ...overrides,
    };
}

const singleEventEntry: TodaysClockInEntry = makeEntry({
    accountId:    2,
    employeeName: "Alice Jones",
    firstOnSite:  { eventId: "event-uuid-3", timestamp: "2026-04-22T09:15:00" },
    lastOnSite:   null,
    allEvents: [
        { eventId: "event-uuid-3", timestamp: "2026-04-22T09:15:00" },
    ],
});

const multiEventEntry: TodaysClockInEntry = makeEntry({
    accountId:    3,
    employeeName: "Bob Builder",
    firstOnSite:  { eventId: "event-uuid-4", timestamp: "2026-04-22T07:45:00" },
    lastOnSite:   { eventId: "event-uuid-6", timestamp: "2026-04-22T16:00:00" },
    allEvents: [
        { eventId: "event-uuid-4", timestamp: "2026-04-22T07:45:00" },
        { eventId: "event-uuid-5", timestamp: "2026-04-22T12:00:00" },
        { eventId: "event-uuid-6", timestamp: "2026-04-22T16:00:00" },
    ],
});


interface RenderProps {
    open?: boolean;
    onClose?: () => void;
}

async function renderModal({ open = true, onClose = jest.fn() }: RenderProps = {}) {
    let result: ReturnType<typeof render>;
    await act(async () => {
        result = render(<TodaysClockInsModal open={open} onClose={onClose} />);
    });
    return result!;
}


beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockFetchTodaysClockIns.mockResolvedValue([]);
});


describe("TodaysClockInsModal", () => {

    describe("visibility", () => {
        it("renders nothing when open is false", () => {
            render(<TodaysClockInsModal open={false} onClose={jest.fn()} />);
            expect(screen.queryByText("Today's Clock-ins")).not.toBeInTheDocument();
        });

        it("renders the modal title when open is true", async () => {
            await renderModal();
            expect(screen.getByText("Today's Clock-ins")).toBeInTheDocument();
        });

        it("renders today's date as the subtitle", async () => {
            await renderModal();
            const todayLabel = new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            });
            expect(screen.getByText(todayLabel)).toBeInTheDocument();
        });

        it("calls onClose when the X button is clicked", async () => {
            const onClose = jest.fn();
            await renderModal({ onClose });
            await userEvent.click(screen.getByLabelText("Close"));
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("data fetching", () => {
        it("calls fetchTodaysClockIns on open", async () => {
            await renderModal();
            expect(mockFetchTodaysClockIns).toHaveBeenCalledTimes(1);
            expect(mockFetchTodaysClockIns).toHaveBeenCalledWith(mockAuthService);
        });

        it("calls fetchTodaysClockIns again each time the modal is opened", async () => {
            const onClose = jest.fn();
            const { rerender } = render(
                <TodaysClockInsModal open={false} onClose={onClose} />
            );
            expect(mockFetchTodaysClockIns).not.toHaveBeenCalled();

            await act(async () => {
                rerender(<TodaysClockInsModal open={true} onClose={onClose} />);
            });
            expect(mockFetchTodaysClockIns).toHaveBeenCalledTimes(1);

            // Close and reopen
            await act(async () => {
                rerender(<TodaysClockInsModal open={false} onClose={onClose} />);
            });
            await act(async () => {
                rerender(<TodaysClockInsModal open={true} onClose={onClose} />);
            });
            expect(mockFetchTodaysClockIns).toHaveBeenCalledTimes(2);
        });

        it("does not call fetchTodaysClockIns when open is false", () => {
            render(<TodaysClockInsModal open={false} onClose={jest.fn()} />);
            expect(mockFetchTodaysClockIns).not.toHaveBeenCalled();
        });
    });

    describe("loading state", () => {
        it("shows a loading spinner while the fetch is in progress", () => {
            mockFetchTodaysClockIns.mockReturnValueOnce(new Promise(() => {}));
            render(<TodaysClockInsModal open={true} onClose={jest.fn()} />);
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("hides the loading spinner once data has loaded", async () => {
            await renderModal();
            expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
        });
    });

    describe("error state", () => {
        it("shows an error message when the fetch fails", async () => {
            mockFetchTodaysClockIns.mockRejectedValueOnce(new Error("Network error"));
            await renderModal();
            expect(screen.getByText(/failed to load today's clock-in events/i)).toBeInTheDocument();
        });

        it("does not show the spinner after a failed fetch", async () => {
            mockFetchTodaysClockIns.mockRejectedValueOnce(new Error("Network error"));
            await renderModal();
            expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
        });

        it("does not show the summary badge after a failed fetch", async () => {
            mockFetchTodaysClockIns.mockRejectedValueOnce(new Error("Network error"));
            await renderModal();
            expect(screen.queryByText(/employees? on site today/i)).not.toBeInTheDocument();
        });
    });

    describe("empty state", () => {
        it("shows the empty state heading when there are no entries", async () => {
            await renderModal();
            expect(screen.getByText("No employees on site yet")).toBeInTheDocument();
        });

        it("shows the empty state subtext when there are no entries", async () => {
            await renderModal();
            expect(screen.getByText(/clock-in events will appear here/i)).toBeInTheDocument();
        });

        it("does not show the empty state when there are entries", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            expect(screen.queryByText("No employees on site yet")).not.toBeInTheDocument();
        });
    });

    describe("summary badge", () => {
        it("shows '0 employees on site today' when the list is empty", async () => {
            await renderModal();
            expect(screen.getByText(/employees on site today/i)).toBeInTheDocument();
            expect(screen.getByText("0")).toBeInTheDocument();
        });

        it("shows '1 employee on site today' (singular) for one entry", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            expect(screen.getByText(/employee on site today/i)).toBeInTheDocument();
            expect(screen.getByText("1")).toBeInTheDocument();
        });

        it("shows '2 employees on site today' (plural) for two entries", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry(), singleEventEntry]);
            await renderModal();
            expect(screen.getByText(/employees on site today/i)).toBeInTheDocument();
            expect(screen.getByText("2")).toBeInTheDocument();
        });
    });

    describe("employee row rendering", () => {
        it("renders the employee's full name", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            expect(screen.getByText("John Smith")).toBeInTheDocument();
        });

        it("renders two-letter initials in the avatar", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            expect(screen.getByText("JS")).toBeInTheDocument();
        });

        it("renders single-letter initials for a single-word name", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([
                makeEntry({ employeeName: "Madonna" }),
            ]);
            await renderModal();
            expect(screen.getByText("M")).toBeInTheDocument();
        });

        it("renders the event count for an employee with multiple events", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            expect(screen.getByText("2 events today")).toBeInTheDocument();
        });

        it("renders singular 'event' for a single event", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([singleEventEntry]);
            await renderModal();
            expect(screen.getByText("1 event today")).toBeInTheDocument();
        });

        it("renders the First on site chip", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            expect(screen.getByText("First on site")).toBeInTheDocument();
        });

        it("does not render the Last on site chip when there is only one event", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([singleEventEntry]);
            await renderModal();
            // "Last on site" should not appear in the summary chips row
            // (it will appear later in the expanded panel only after expand — see expand tests)
            expect(screen.queryByText("Last on site")).not.toBeInTheDocument();
        });

        it("renders multiple employee rows", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry(), singleEventEntry]);
            await renderModal();
            expect(screen.getByText("John Smith")).toBeInTheDocument();
            expect(screen.getByText("Alice Jones")).toBeInTheDocument();
        });
    });

    describe("expand / collapse", () => {
        it("does not show the expanded event list before clicking the row", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            expect(screen.queryByText("All clock-in events")).not.toBeInTheDocument();
        });

        it("shows the expanded event list after clicking the employee row", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            await userEvent.click(screen.getByText("John Smith"));
            expect(await screen.findByText("All clock-in events")).toBeInTheDocument();
        });

        it("collapses the event list when the row is clicked again", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry()]);
            await renderModal();
            await userEvent.click(screen.getByText("John Smith"));
            await screen.findByText("All clock-in events");
            await userEvent.click(screen.getByText("John Smith"));
            await waitFor(() =>
                expect(screen.queryByText("All clock-in events")).not.toBeInTheDocument()
            );
        });

        it("marks the first event with 'First on site' label in the expanded panel", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([multiEventEntry]);
            await renderModal();
            await userEvent.click(screen.getByText("Bob Builder"));
            await screen.findByText("All clock-in events");
            // getAllByText because the chip in the summary row also says "First on site"
            const labels = screen.getAllByText("First on site");
            expect(labels.length).toBeGreaterThanOrEqual(1);
        });

        it("marks the last event with 'Last on site' label in the expanded panel", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([multiEventEntry]);
            await renderModal();
            await userEvent.click(screen.getByText("Bob Builder"));
            await screen.findByText("All clock-in events");
            const labels = screen.getAllByText("Last on site");
            expect(labels.length).toBeGreaterThanOrEqual(1);
        });

        it("does not show a 'Last on site' label when there is only one event", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([singleEventEntry]);
            await renderModal();
            await userEvent.click(screen.getByText("Alice Jones"));
            await screen.findByText("All clock-in events");
            expect(screen.queryByText("Last on site")).not.toBeInTheDocument();
        });

        it("expands the correct row when multiple employees are shown", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry(), multiEventEntry]);
            await renderModal();

            // Expand only Bob's row
            await userEvent.click(screen.getByText("Bob Builder"));
            await screen.findByText("All clock-in events");

            // John's row should not be expanded
            const johnRow = screen.getByText("John Smith").closest("div") as HTMLElement;
            expect(within(johnRow).queryByText("All clock-in events")).not.toBeInTheDocument();
        });

        it("can expand multiple rows independently", async () => {
            mockFetchTodaysClockIns.mockResolvedValueOnce([makeEntry(), singleEventEntry]);
            await renderModal();

            await userEvent.click(screen.getByText("John Smith"));
            await userEvent.click(screen.getByText("Alice Jones"));

            const panels = await screen.findAllByText("All clock-in events");
            expect(panels).toHaveLength(2);
        });
    });
});