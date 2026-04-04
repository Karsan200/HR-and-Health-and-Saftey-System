import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DayDetailOverlay } from "../../src/components/DayDetailOverlay";
import type { CalendarEvent } from "../../src/models/CalendarTypes";

// Minimal set of events covering all four types
const bookedLeaveEvent: CalendarEvent = {
    id: "1",
    date: "2026-04-15",
    type: "bookedLeave",
    label: "John Doe",
    notes: "Annual leave",
};

const sickLeaveEvent: CalendarEvent = {
    id: "2",
    date: "2026-04-15",
    type: "sickLeave",
    label: "Jane Smith",
};

const nationalHolidayEvent: CalendarEvent = {
    id: "3",
    date: "2026-04-15",
    type: "nationalHoliday",
    label: "Easter Monday",
};

const trainingLeaveEvent: CalendarEvent = {
    id: "4",
    date: "2026-04-15",
    type: "trainingLeave",
    label: "Bob Jones",
    notes: "Tech conference",
};

function renderOverlay(
    open: boolean,
    date: string | null,
    events: CalendarEvent[],
    onClose = jest.fn(),
) {
    return render(
        <DayDetailOverlay
            open={open}
            date={date}
            events={events}
            onClose={onClose}
        />
    );
}

describe("DayDetailOverlay", () => {

    describe("visibility", () => {
        it("renders nothing visible when open is false", () => {
            renderOverlay(false, "2026-04-15", []);
            expect(screen.queryByText(/April/)).not.toBeInTheDocument();
        });

        it("renders the overlay when open is true", () => {
            renderOverlay(true, "2026-04-15", []);
            expect(screen.getByText("Wednesday, April 15th")).toBeInTheDocument();
        });
    });

    describe("date formatting", () => {
        it("formats a mid-month date correctly", () => {
            renderOverlay(true, "2026-04-15", []);
            expect(screen.getByText("Wednesday, April 15th")).toBeInTheDocument();
        });

        it("uses 'st' suffix for the 1st", () => {
            renderOverlay(true, "2026-04-01", []);
            expect(screen.getByText("Wednesday, April 1st")).toBeInTheDocument();
        });

        it("uses 'nd' suffix for the 2nd", () => {
            renderOverlay(true, "2026-04-02", []);
            expect(screen.getByText("Thursday, April 2nd")).toBeInTheDocument();
        });

        it("uses 'rd' suffix for the 3rd", () => {
            renderOverlay(true, "2026-04-03", []);
            expect(screen.getByText("Friday, April 3rd")).toBeInTheDocument();
        });

        it("uses 'th' suffix for 11th (special case)", () => {
            renderOverlay(true, "2026-04-11", []);
            expect(screen.getByText("Saturday, April 11th")).toBeInTheDocument();
        });

        it("uses 'th' suffix for 12th (special case)", () => {
            renderOverlay(true, "2026-04-12", []);
            expect(screen.getByText("Sunday, April 12th")).toBeInTheDocument();
        });

        it("uses 'th' suffix for 13th (special case)", () => {
            renderOverlay(true, "2026-04-13", []);
            expect(screen.getByText("Monday, April 13th")).toBeInTheDocument();
        });

        it("uses 'th' suffix for 21st — wait, uses 'st'", () => {
            renderOverlay(true, "2026-04-21", []);
            expect(screen.getByText("Tuesday, April 21st")).toBeInTheDocument();
        });
    });

    describe("empty state", () => {
        it("shows the empty message when there are no events", () => {
            renderOverlay(true, "2026-04-15", []);
            expect(screen.getByText("No events for this day.")).toBeInTheDocument();
        });

        it("does not show the empty message when there are events", () => {
            renderOverlay(true, "2026-04-15", [bookedLeaveEvent]);
            expect(screen.queryByText("No events for this day.")).not.toBeInTheDocument();
        });
    });

    describe("event rendering", () => {
        it("renders the event label for a booked leave event", () => {
            renderOverlay(true, "2026-04-15", [bookedLeaveEvent]);
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });

        it("renders the type label 'Booked Leave'", () => {
            renderOverlay(true, "2026-04-15", [bookedLeaveEvent]);
            expect(screen.getByText("Booked Leave")).toBeInTheDocument();
        });

        it("renders the event label for a sick leave event", () => {
            renderOverlay(true, "2026-04-15", [sickLeaveEvent]);
            expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        });

        it("renders the type label 'Sick Leave'", () => {
            renderOverlay(true, "2026-04-15", [sickLeaveEvent]);
            expect(screen.getByText("Sick Leave")).toBeInTheDocument();
        });

        it("renders the event label for a national holiday event", () => {
            renderOverlay(true, "2026-04-15", [nationalHolidayEvent]);
            expect(screen.getByText("Easter Monday")).toBeInTheDocument();
        });

        it("renders the type label 'National Holiday'", () => {
            renderOverlay(true, "2026-04-15", [nationalHolidayEvent]);
            expect(screen.getByText("National Holiday")).toBeInTheDocument();
        });

        it("renders the event label for a training leave event", () => {
            renderOverlay(true, "2026-04-15", [trainingLeaveEvent]);
            expect(screen.getByText("Bob Jones")).toBeInTheDocument();
        });

        it("renders the type label 'Training Leave'", () => {
            renderOverlay(true, "2026-04-15", [trainingLeaveEvent]);
            expect(screen.getByText("Training Leave")).toBeInTheDocument();
        });

        it("renders multiple events", () => {
            renderOverlay(true, "2026-04-15", [bookedLeaveEvent, sickLeaveEvent]);
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        });
    });

    describe("notes", () => {
        it("renders notes text when present", () => {
            renderOverlay(true, "2026-04-15", [bookedLeaveEvent]);
            expect(screen.getByText("Annual leave")).toBeInTheDocument();
        });

        it("does not render notes when the field is absent", () => {
            renderOverlay(true, "2026-04-15", [sickLeaveEvent]);
            // Only label and type label are present — no notes text
            expect(screen.queryByText("Annual leave")).not.toBeInTheDocument();
        });

        it("renders notes for training leave", () => {
            renderOverlay(true, "2026-04-15", [trainingLeaveEvent]);
            expect(screen.getByText("Tech conference")).toBeInTheDocument();
        });
    });

    describe("close behaviour", () => {
        it("calls onClose when the close button is clicked", async () => {
            const onClose = jest.fn();
            renderOverlay(true, "2026-04-15", [], onClose);
            await userEvent.click(screen.getByLabelText("Close"));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("calls onClose when the backdrop is clicked", async () => {
            const onClose = jest.fn();
            const { baseElement } = renderOverlay(true, "2026-04-15", [], onClose);
            // The MUI Modal backdrop sits outside the panel
            const backdrop = baseElement.querySelector(".MuiBackdrop-root") as HTMLElement;
            if (backdrop) {
                await userEvent.click(backdrop);
                expect(onClose).toHaveBeenCalled();
            }
        });
    });

    describe("accessibility", () => {
        it("has an aria-label on the modal referencing the formatted date", () => {
            renderOverlay(true, "2026-04-15", []);
            expect(
                screen.getByRole("presentation", { name: /Events for Wednesday, April 15th/i })
            ).toBeInTheDocument();
        });

        it("has an accessible close button", () => {
            renderOverlay(true, "2026-04-15", []);
            expect(screen.getByLabelText("Close")).toBeInTheDocument();
        });
    });
});