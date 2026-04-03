import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CalendarPage } from "../../src/pages/CalendarPage";
import { useAuth } from "../../src/AuthContext";
import { fetchCalendarEvents } from "../../src/logic/LeaveCalendarService";
import type { CalendarEvent } from "../../src/pages/CalendarPage";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/LeaveCalendarService");
jest.mock("../../src/components/SectionNavbar", () => ({
    SectionNavBar: ({ tabs }: { tabs: { label: string; route: string }[] }) => (
        <nav data-testid="section-nav">
            {tabs.map(t => <span key={t.route}>{t.label}</span>)}
        </nav>
    ),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockFetchCalendarEvents = fetchCalendarEvents as jest.Mock;

const MOCK_AUTH_SERVICE = { token: "test-token" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
    return {
        id: "evt-1",
        date: "2025-06-15",
        type: "bookedLeave",
        label: "Annual Leave",
        ...overrides,
    };
}

function renderCalendar(props: Partial<React.ComponentProps<typeof CalendarPage>> = {}) {
    return render(<CalendarPage {...props} />);
}

// Pin "today" to 15 Jun 2025 so all tests are date-stable.
const FIXED_TODAY = new Date(2025, 5, 15);

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_TODAY);

    mockUseAuth.mockReturnValue({ authenticationService: MOCK_AUTH_SERVICE });
    mockFetchCalendarEvents.mockResolvedValue([]);
});

afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
});

// ─── Initial render ───────────────────────────────────────────────────────────

describe("initial render", () => {
    it("renders the section navigation bar", async () => {
        renderCalendar();
        expect(await screen.findByTestId("section-nav")).toBeInTheDocument();
    });

    it("renders all three section nav tab labels", async () => {
        renderCalendar();
        await screen.findByTestId("section-nav");
        expect(screen.getByText("Calendar View")).toBeInTheDocument();
        expect(screen.getByText("Pending Requests")).toBeInTheDocument();
        expect(screen.getByText("Clock Overrides")).toBeInTheDocument();
    });

    it("shows the current month and year in the nav bar", async () => {
        renderCalendar();
        expect(await screen.findByText(/june 2025/i)).toBeInTheDocument();
    });

    it("renders all seven day-of-week headers", async () => {
        renderCalendar();
        await screen.findByText(/june 2025/i);
        for (const day of ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]) {
            expect(screen.getByText(day)).toBeInTheDocument();
        }
    });

    it("renders a previous-month button", async () => {
        renderCalendar();
        expect(
            await screen.findByRole("button", { name: /previous month/i })
        ).toBeInTheDocument();
    });

    it("renders a next-month button", async () => {
        renderCalendar();
        expect(
            await screen.findByRole("button", { name: /next month/i })
        ).toBeInTheDocument();
    });

    it("renders the key with all four event-type labels", async () => {
        renderCalendar();
        expect(await screen.findByText("National Holiday")).toBeInTheDocument();
        expect(screen.getByText("Sick Leave")).toBeInTheDocument();
        expect(screen.getByText("Booked Leave")).toBeInTheDocument();
        expect(screen.getByText("Training Leave")).toBeInTheDocument();
    });
});

// ─── Loading state ────────────────────────────────────────────────────────────

describe("loading state", () => {
    it("shows a loading spinner while the fetch is in flight", () => {
        mockFetchCalendarEvents.mockReturnValue(new Promise(() => {}));
        renderCalendar();
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("removes the spinner once data has loaded", async () => {
        renderCalendar();
        await waitFor(() =>
            expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
        );
    });

    it("does not render the day-of-week headers while loading", () => {
        mockFetchCalendarEvents.mockReturnValue(new Promise(() => {}));
        renderCalendar();
        expect(screen.queryByText("MON")).not.toBeInTheDocument();
    });
});

// ─── Error state ──────────────────────────────────────────────────────────────

describe("error state", () => {
    beforeEach(() => {
        mockFetchCalendarEvents.mockRejectedValue(new Error("Network error"));
    });

    it("displays an error message when the fetch fails", async () => {
        renderCalendar();
        expect(
            await screen.findByText(/failed to load calendar data/i)
        ).toBeInTheDocument();
    });

    it("does not render the calendar grid when an error occurs", async () => {
        renderCalendar();
        await screen.findByText(/failed to load calendar data/i);
        expect(screen.queryByText("MON")).not.toBeInTheDocument();
    });

    it("hides the spinner after a fetch failure", async () => {
        renderCalendar();
        await screen.findByText(/failed to load calendar data/i);
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
});

// ─── Service calls ────────────────────────────────────────────────────────────

describe("service calls", () => {
    it("calls fetchCalendarEvents with the correct year and month on mount", async () => {
        renderCalendar();
        await waitFor(() =>
            expect(mockFetchCalendarEvents).toHaveBeenCalledWith(
                2025, 6, MOCK_AUTH_SERVICE
            )
        );
    });

    it("passes the authenticationService from useAuth", async () => {
        renderCalendar();
        await waitFor(() =>
            expect(mockFetchCalendarEvents).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                MOCK_AUTH_SERVICE
            )
        );
    });

    it("re-fetches when navigating to the next month", async () => {
        renderCalendar();
        await waitFor(() => expect(mockFetchCalendarEvents).toHaveBeenCalledTimes(1));

        await userEvent.click(screen.getByRole("button", { name: /next month/i }));

        await waitFor(() => expect(mockFetchCalendarEvents).toHaveBeenCalledTimes(2));
        expect(mockFetchCalendarEvents).toHaveBeenLastCalledWith(2025, 7, MOCK_AUTH_SERVICE);
    });

    it("re-fetches when navigating to the previous month", async () => {
        renderCalendar();
        await waitFor(() => expect(mockFetchCalendarEvents).toHaveBeenCalledTimes(1));

        await userEvent.click(screen.getByRole("button", { name: /previous month/i }));

        await waitFor(() => expect(mockFetchCalendarEvents).toHaveBeenCalledTimes(2));
        expect(mockFetchCalendarEvents).toHaveBeenLastCalledWith(2025, 5, MOCK_AUTH_SERVICE);
    });
});

// ─── Month navigation ─────────────────────────────────────────────────────────

describe("month navigation", () => {
    it("shows the previous month label after clicking the back button", async () => {
        renderCalendar();
        await screen.findByText(/june 2025/i);

        await userEvent.click(screen.getByRole("button", { name: /previous month/i }));

        expect(await screen.findByText(/may 2025/i)).toBeInTheDocument();
    });

    it("shows the next month label after clicking the forward button", async () => {
        renderCalendar();
        await screen.findByText(/june 2025/i);

        await userEvent.click(screen.getByRole("button", { name: /next month/i }));

        expect(await screen.findByText(/july 2025/i)).toBeInTheDocument();
    });

    it("wraps from January to December of the previous year", async () => {
        jest.setSystemTime(new Date(2025, 0, 1));
        renderCalendar();
        await screen.findByText(/january 2025/i);

        await userEvent.click(screen.getByRole("button", { name: /previous month/i }));

        expect(await screen.findByText(/december 2024/i)).toBeInTheDocument();
    });

    it("wraps from December to January of the next year", async () => {
        jest.setSystemTime(new Date(2025, 11, 1));
        renderCalendar();
        await screen.findByText(/december 2025/i);

        await userEvent.click(screen.getByRole("button", { name: /next month/i }));

        expect(await screen.findByText(/january 2026/i)).toBeInTheDocument();
    });

    it("can navigate forward multiple months sequentially", async () => {
        renderCalendar();
        await screen.findByText(/june 2025/i);

        const nextBtn = screen.getByRole("button", { name: /next month/i });
        await userEvent.click(nextBtn);
        await userEvent.click(nextBtn);
        await userEvent.click(nextBtn);

        expect(await screen.findByText(/september 2025/i)).toBeInTheDocument();
    });
});

// ─── Calendar grid ────────────────────────────────────────────────────────────

describe("calendar grid", () => {
    it("renders a number of day cells that is a multiple of 7", async () => {
        renderCalendar();
        await screen.findByText("MON");
        // Grab every element whose sole text content is 1–2 digits
        const dayCells = screen
            .getAllByText(/^\d{1,2}$/)
            .filter(el => Number(el.textContent) >= 1 && Number(el.textContent) <= 31);
        expect(dayCells.length % 7).toBe(0);
        expect(dayCells.length).toBeGreaterThanOrEqual(28);
    });

    it("includes a cell with the current day number", async () => {
        renderCalendar();
        await screen.findByText("MON");
        // day 15 should be present
        expect(screen.getAllByText("15").length).toBeGreaterThanOrEqual(1);
    });
});

// ─── Event rendering ──────────────────────────────────────────────────────────

describe("event rendering", () => {
    it("renders a booked-leave chip with its label on the correct day", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ date: "2025-06-15", label: "Annual Leave", type: "bookedLeave" }),
        ]);
        renderCalendar();
        expect(await screen.findByText("Annual Leave")).toBeInTheDocument();
    });

    it("renders a national holiday chip", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ type: "nationalHoliday", label: "Bank Holiday", date: "2025-06-02" }),
        ]);
        renderCalendar();
        expect(await screen.findByText("Bank Holiday")).toBeInTheDocument();
    });

    it("renders a sick leave chip", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ type: "sickLeave", label: "Sick Day", date: "2025-06-10" }),
        ]);
        renderCalendar();
        expect(await screen.findByText("Sick Day")).toBeInTheDocument();
    });

    it("renders a training leave chip", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ type: "trainingLeave", label: "Workshop", date: "2025-06-11" }),
        ]);
        renderCalendar();
        expect(await screen.findByText("Workshop")).toBeInTheDocument();
    });

    it("shows both events when a day has exactly two events (no overflow label)", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ id: "a", date: "2025-06-15", label: "Event A" }),
            makeEvent({ id: "b", date: "2025-06-15", label: "Event B" }),
        ]);
        renderCalendar();
        await screen.findByText("Event A");
        expect(screen.getByText("Event B")).toBeInTheDocument();
        expect(screen.queryByText(/\+\d+ more/i)).not.toBeInTheDocument();
    });

    it("shows '+1 more' when a day has three events", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ id: "a", date: "2025-06-15", label: "Event A" }),
            makeEvent({ id: "b", date: "2025-06-15", label: "Event B" }),
            makeEvent({ id: "c", date: "2025-06-15", label: "Event C" }),
        ]);
        renderCalendar();
        await screen.findByText("Event A");
        expect(screen.queryByText("Event C")).not.toBeInTheDocument();
        expect(screen.getByText("+1 more")).toBeInTheDocument();
    });

    it("shows '+2 more' when a day has four events", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ id: "a", date: "2025-06-15", label: "Ev A" }),
            makeEvent({ id: "b", date: "2025-06-15", label: "Ev B" }),
            makeEvent({ id: "c", date: "2025-06-15", label: "Ev C" }),
            makeEvent({ id: "d", date: "2025-06-15", label: "Ev D" }),
        ]);
        renderCalendar();
        await screen.findByText("Ev A");
        expect(screen.getByText("+2 more")).toBeInTheDocument();
    });

    it("does not render events whose date falls outside the current month", async () => {
        // 31 May is a padding day in the June grid but must show no chip
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ id: "x", date: "2025-05-31", label: "Past Month Event" }),
        ]);
        renderCalendar();
        await screen.findByText("MON");
        expect(screen.queryByText("Past Month Event")).not.toBeInTheDocument();
    });

    it("renders events on multiple different days independently", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({ id: "a", date: "2025-06-03", label: "Day 3 Event" }),
            makeEvent({ id: "b", date: "2025-06-20", label: "Day 20 Event" }),
        ]);
        renderCalendar();
        expect(await screen.findByText("Day 3 Event")).toBeInTheDocument();
        expect(screen.getByText("Day 20 Event")).toBeInTheDocument();
    });
});

// ─── Tooltip ──────────────────────────────────────────────────────────────────

describe("event tooltip", () => {
    it("shows the event notes in the tooltip when the chip is hovered", async () => {
        mockFetchCalendarEvents.mockResolvedValue([
            makeEvent({
                date: "2025-06-15",
                label: "Leave",
                notes: "Pre-approved by manager",
            }),
        ]);
        renderCalendar();
        const chip = await screen.findByText("Leave");
        await userEvent.hover(chip);
        await waitFor(() =>
            expect(screen.getByText("Pre-approved by manager")).toBeInTheDocument()
        );
    });
});

// ─── onDayClick callback ──────────────────────────────────────────────────────

describe("onDayClick callback", () => {
    it("fires with the correct ISO date when a current-month cell is clicked", async () => {
        const onDayClick = jest.fn();
        renderCalendar({ onDayClick });
        await screen.findByText("MON");

        // Click the first occurrence of "15" — today's cell
        await userEvent.click(screen.getAllByText("15")[0]);

        expect(onDayClick).toHaveBeenCalledWith("2025-06-15");
    });

    it("fires with the correct ISO date for a day that is not today", async () => {
        const onDayClick = jest.fn();
        renderCalendar({ onDayClick });
        await screen.findByText("MON");

        // Click day 20 in the current month
        await userEvent.click(screen.getByText("20"));

        expect(onDayClick).toHaveBeenCalledWith("2025-06-20");
    });

    it("does not fire when an out-of-month padding cell is clicked", async () => {
        const onDayClick = jest.fn();
        renderCalendar({ onDayClick });
        await screen.findByText("MON");

        // June 2025 grid starts with days 26–31 from May as padding.
        // Clicking "26" (first occurrence) is the May padding day.
        const allTwentySix = screen.getAllByText("26");
        await userEvent.click(allTwentySix[0]);

        expect(onDayClick).not.toHaveBeenCalled();
    });
});

// ─── onEventClick callback ────────────────────────────────────────────────────

describe("onEventClick callback", () => {
    it("fires with the full event object when an event chip is clicked", async () => {
        const event = makeEvent({ date: "2025-06-15", label: "Annual Leave" });
        mockFetchCalendarEvents.mockResolvedValue([event]);
        const onEventClick = jest.fn();
        renderCalendar({ onEventClick });

        await userEvent.click(await screen.findByText("Annual Leave"));

        expect(onEventClick).toHaveBeenCalledWith(event);
    });

    it("does not also fire onDayClick when an event chip is clicked", async () => {
        const event = makeEvent({ date: "2025-06-15", label: "Annual Leave" });
        mockFetchCalendarEvents.mockResolvedValue([event]);
        const onDayClick = jest.fn();
        const onEventClick = jest.fn();
        renderCalendar({ onDayClick, onEventClick });

        await userEvent.click(await screen.findByText("Annual Leave"));

        expect(onEventClick).toHaveBeenCalledTimes(1);
        expect(onDayClick).not.toHaveBeenCalled();
    });
});