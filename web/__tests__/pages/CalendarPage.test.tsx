import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { CalendarPage } from "../../src/pages/CalendarPage";
import { useAuth } from "../../src/AuthContext";
import { fetchCalendarEvents } from "../../src/logic/LeaveCalendarService";
import type { CalendarEvent } from "../../src/models/CalendarTypes";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/LeaveCalendarService");
jest.mock("../../src/components/DayDetailOverlay", () => ({
    DayDetailOverlay: ({ open, date, events, onClose }: {
        open: boolean;
        date: string | null;
        events: { id: string; label: string }[];
        onClose: () => void;
    }) => open ? (
        <div data-testid="day-detail-overlay">
            <span data-testid="overlay-date">{date}</span>
            {events.map(e => (
                <span key={e.id} data-testid="overlay-event">{e.label}</span>
            ))}
            <button onClick={onClose}>Close</button>
        </div>
    ) : null,
}));

const mockUseAuth = useAuth as jest.Mock;
const mockFetchCalendarEvents = fetchCalendarEvents as jest.Mock;

const mockAuthService = { getToken: jest.fn() };

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockFetchCalendarEvents.mockResolvedValue([]);
});

function renderCalendarPage(props = {}) {
    return render(
        <MemoryRouter initialEntries={["/calendar"]}>
            <CalendarPage {...props} />
        </MemoryRouter>
    );
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function currentMonthLabel() {
    const now = new Date();
    return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function getPrevButton() {
    return screen.getByLabelText(/previous month/i);
}

function getNextButton() {
    return screen.getByLabelText(/next month/i);
}

function currentMonthDate(day: number): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

describe("CalendarPage", () => {

    describe("initial render", () => {
        it("renders the current month and year in the navigation bar", async () => {
            renderCalendarPage();
            await waitFor(() =>
                expect(screen.getByText(currentMonthLabel())).toBeInTheDocument()
            );
        });

        it("renders all day of week headers", async () => {
            renderCalendarPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            for (const day of ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]) {
                expect(screen.getByText(day)).toBeInTheDocument();
            }
        });

        it("renders all four calendar key items", async () => {
            renderCalendarPage();
            await waitFor(() => {
                expect(screen.getByText("National Holiday")).toBeInTheDocument();
                expect(screen.getByText("Sick Leave")).toBeInTheDocument();
                expect(screen.getByText("Booked Leave")).toBeInTheDocument();
                expect(screen.getByText("Training Leave")).toBeInTheDocument();
            });
        });

        it("renders the previous and next month navigation buttons", () => {
            renderCalendarPage();
            expect(getPrevButton()).toBeInTheDocument();
            expect(getNextButton()).toBeInTheDocument();
        });

        it("calls fetchCalendarEvents on mount", async () => {
            renderCalendarPage();
            await waitFor(() =>
                expect(mockFetchCalendarEvents).toHaveBeenCalledTimes(1)
            );
        });

        it("does not show the overlay on initial render", async () => {
            renderCalendarPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            expect(screen.queryByTestId("day-detail-overlay")).not.toBeInTheDocument();
        });
    });

    describe("loading state", () => {
        it("shows a loading spinner while calendar data is being fetched", () => {
            mockFetchCalendarEvents.mockReturnValueOnce(new Promise(() => {}));
            renderCalendarPage();
            expect(screen.getByRole("progressbar")).toBeInTheDocument();
        });

        it("hides the loading spinner after data has loaded", async () => {
            renderCalendarPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
        });

        it("hides the day headers while loading", () => {
            mockFetchCalendarEvents.mockReturnValueOnce(new Promise(() => {}));
            renderCalendarPage();
            expect(screen.queryByText("MON")).not.toBeInTheDocument();
        });
    });

    describe("error state", () => {
        it("shows an error message when the fetch fails", async () => {
            mockFetchCalendarEvents.mockRejectedValueOnce(new Error("Network error"));
            renderCalendarPage();
            expect(await screen.findByText(/failed to load calendar data/i)).toBeInTheDocument();
        });

        it("does not show the calendar grid when there is an error", async () => {
            mockFetchCalendarEvents.mockRejectedValueOnce(new Error("Network error"));
            renderCalendarPage();
            await waitFor(() =>
                expect(screen.queryByText("MON")).not.toBeInTheDocument()
            );
        });

        it("does not show a loading spinner after a failed fetch", async () => {
            mockFetchCalendarEvents.mockRejectedValueOnce(new Error("Network error"));
            renderCalendarPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
        });
    });

    describe("month navigation", () => {
        it("navigates to the previous month when the back button is clicked", async () => {
            renderCalendarPage();
            await waitFor(() => screen.getByText(currentMonthLabel()));

            const now = new Date();
            const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const expected = `${MONTH_NAMES[prev.getMonth()]} ${prev.getFullYear()}`;

            await userEvent.click(getPrevButton());
            expect(screen.getByText(expected)).toBeInTheDocument();
        });

        it("navigates to the next month when the forward button is clicked", async () => {
            renderCalendarPage();
            await waitFor(() => screen.getByText(currentMonthLabel()));

            const now = new Date();
            const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const expected = `${MONTH_NAMES[next.getMonth()]} ${next.getFullYear()}`;

            await userEvent.click(getNextButton());
            expect(screen.getByText(expected)).toBeInTheDocument();
        });

        it("wraps backwards from January to December of the previous year", async () => {
            renderCalendarPage();
            await waitFor(() => screen.getByText(currentMonthLabel()));

            const now = new Date();
            const clicksNeeded = now.getMonth() + 1;
            for (let i = 0; i < clicksNeeded; i++) {
                await userEvent.click(getPrevButton());
            }

            expect(screen.getByText(`December ${now.getFullYear() - 1}`)).toBeInTheDocument();
        });

        it("wraps forwards from December to January of the next year", async () => {
            renderCalendarPage();
            await waitFor(() => screen.getByText(currentMonthLabel()));

            const now = new Date();
            const clicksNeeded = 12 - now.getMonth();
            for (let i = 0; i < clicksNeeded; i++) {
                await userEvent.click(getNextButton());
            }

            expect(screen.getByText(`January ${now.getFullYear() + 1}`)).toBeInTheDocument();
        });

        it("fetches new calendar data when navigating to a different month", async () => {
            renderCalendarPage();
            await waitFor(() => expect(mockFetchCalendarEvents).toHaveBeenCalledTimes(1));

            await userEvent.click(getNextButton());
            await waitFor(() => expect(mockFetchCalendarEvents).toHaveBeenCalledTimes(2));
        });
    });

    describe("event rendering", () => {
        it("renders a booked leave chip on the correct day", async () => {
            mockFetchCalendarEvents.mockResolvedValueOnce([
                { id: "1", date: currentMonthDate(15), type: "bookedLeave", label: "John Doe" },
            ]);
            renderCalendarPage();
            expect(await screen.findByText("John Doe")).toBeInTheDocument();
        });

        it("renders a sick leave chip on the correct day", async () => {
            mockFetchCalendarEvents.mockResolvedValueOnce([
                { id: "2", date: currentMonthDate(15), type: "sickLeave", label: "Jane Smith" },
            ]);
            renderCalendarPage();
            expect(await screen.findByText("Jane Smith")).toBeInTheDocument();
        });

        it("renders a national holiday chip on the correct day", async () => {
            mockFetchCalendarEvents.mockResolvedValueOnce([
                { id: "3", date: currentMonthDate(15), type: "nationalHoliday", label: "Christmas" },
            ]);
            renderCalendarPage();
            expect(await screen.findByText("Christmas")).toBeInTheDocument();
        });

        it("renders a training leave chip on the correct day", async () => {
            mockFetchCalendarEvents.mockResolvedValueOnce([
                { id: "4", date: currentMonthDate(15), type: "trainingLeave", label: "Alice Training" },
            ]);
            renderCalendarPage();
            expect(await screen.findByText("Alice Training")).toBeInTheDocument();
        });

        it("shows an overflow label when a day has more than two events", async () => {
            mockFetchCalendarEvents.mockResolvedValueOnce([
                { id: "1", date: currentMonthDate(15), type: "bookedLeave", label: "Person One" },
                { id: "2", date: currentMonthDate(15), type: "bookedLeave", label: "Person Two" },
                { id: "3", date: currentMonthDate(15), type: "sickLeave",   label: "Person Three" },
            ]);
            renderCalendarPage();
            expect(await screen.findByText("+1 more")).toBeInTheDocument();
        });

        it("shows exactly two chips and no overflow label when a day has exactly two events", async () => {
            mockFetchCalendarEvents.mockResolvedValueOnce([
                { id: "1", date: currentMonthDate(15), type: "bookedLeave", label: "Person One" },
                { id: "2", date: currentMonthDate(15), type: "sickLeave",   label: "Person Two" },
            ]);
            renderCalendarPage();
            await waitFor(() => {
                expect(screen.getByText("Person One")).toBeInTheDocument();
                expect(screen.getByText("Person Two")).toBeInTheDocument();
                expect(screen.queryByText(/more/i)).not.toBeInTheDocument();
            });
        });

        it("renders no event chips and no overflow label when there are no events", async () => {
            renderCalendarPage();
            await waitFor(() =>
                expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
            );
            expect(screen.queryByText(/more/i)).not.toBeInTheDocument();
        });
    });

    describe("day click — overlay", () => {
        it("opens the overlay when a current month day is clicked", async () => {
            renderCalendarPage();
            await waitFor(() => screen.getByText("15"));

            await userEvent.click(screen.getByText("15"));

            expect(screen.getByTestId("day-detail-overlay")).toBeInTheDocument();
        });

        it("passes the correct ISO date to the overlay", async () => {
            renderCalendarPage();
            await waitFor(() => screen.getByText("15"));

            await userEvent.click(screen.getByText("15"));

            expect(screen.getByTestId("overlay-date")).toHaveTextContent(currentMonthDate(15));
        });

        it("passes the correct events for the clicked date to the overlay", async () => {
            mockFetchCalendarEvents.mockResolvedValueOnce([
                { id: "1", date: currentMonthDate(15), type: "bookedLeave", label: "John Doe" },
                { id: "2", date: currentMonthDate(15), type: "sickLeave",   label: "Jane Smith" },
            ]);
            renderCalendarPage();
            await waitFor(() => screen.getByText("15"));

            await userEvent.click(screen.getByText("15"));

            const overlayEvents = screen.getAllByTestId("overlay-event");
            expect(overlayEvents).toHaveLength(2);
            expect(overlayEvents[0]).toHaveTextContent("John Doe");
            expect(overlayEvents[1]).toHaveTextContent("Jane Smith");
        });

        it("passes an empty events array to the overlay when the day has no events", async () => {
            renderCalendarPage();
            await waitFor(() => screen.getByText("15"));

            await userEvent.click(screen.getByText("15"));

            expect(screen.queryAllByTestId("overlay-event")).toHaveLength(0);
        });

        it("closes the overlay when onClose is called", async () => {
            renderCalendarPage();
            await waitFor(() => screen.getByText("15"));

            await userEvent.click(screen.getByText("15"));
            expect(screen.getByTestId("day-detail-overlay")).toBeInTheDocument();

            await userEvent.click(screen.getByRole("button", { name: /close/i }));
            expect(screen.queryByTestId("day-detail-overlay")).not.toBeInTheDocument();
        });
    });

    describe("event chip click callback", () => {
        it("calls onEventClick with the correct event when a chip is clicked", async () => {
            const onEventClick = jest.fn();
            const event: CalendarEvent = {
                id: "1",
                date: currentMonthDate(15),
                type: "bookedLeave",
                label: "John Doe",
                notes: "Holiday",
            };
            mockFetchCalendarEvents.mockResolvedValueOnce([event]);

            renderCalendarPage({ onEventClick });

            await userEvent.click(await screen.findByText("John Doe"));
            expect(onEventClick).toHaveBeenCalledWith(event);
        });
    });

    describe("fetchCalendarEvents arguments", () => {
        it("passes the correct year, month and auth service on mount", async () => {
            renderCalendarPage();
            const now = new Date();
            await waitFor(() =>
                expect(mockFetchCalendarEvents).toHaveBeenCalledWith(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    mockAuthService
                )
            );
        });

        it("passes the updated month after navigating forward", async () => {
            renderCalendarPage();
            await waitFor(() => expect(mockFetchCalendarEvents).toHaveBeenCalledTimes(1));

            await userEvent.click(getNextButton());

            const now = new Date();
            const nextYear  = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
            const nextMonth = now.getMonth() === 11 ? 1 : now.getMonth() + 2;

            await waitFor(() =>
                expect(mockFetchCalendarEvents).toHaveBeenCalledWith(
                    nextYear,
                    nextMonth,
                    mockAuthService
                )
            );
        });
    });
});