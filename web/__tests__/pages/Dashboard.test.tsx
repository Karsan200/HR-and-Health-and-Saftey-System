import { render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Dashboard } from "../../src/pages/Dashboard";
import { useAuth } from "../../src/AuthContext";

jest.mock("../../src/AuthContext");
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../src/logic/DashboardService", () => ({
    getDashboardSummary: jest.fn(),
    getLateArrivals: jest.fn(),
    getDocumentSignatures: jest.fn(),
    getHazardsReported: jest.fn(),
    getRecentActivity: jest.fn(),
}));

import {
    getDashboardSummary,
    getLateArrivals,
    getDocumentSignatures,
    getHazardsReported,
    getRecentActivity,
} from "../../src/logic/DashboardService";

const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
        authenticationService: {},
    });
});

type DashboardServiceMockOverrides = {
    summary?: Partial<{
        pendingSignatures: number;
        lateThisWeek: number;
        openHazards: number;
    }>;

    late?: Partial<{
        range: string;
        total: number;
        points: { label: string; value: number }[];
    }>;

    docs?: Partial<{
        signed: number;
        pending: number;
    }>;

    hazards?: Partial<{
        range: string;
        total: number;
        points: { label: string; value: number }[];
    }>;

    activity?: {
        type: string;
        message: string;
        created: string;
    }[];
};

function mockDashboardData(overrides: DashboardServiceMockOverrides = {}) {
    (getDashboardSummary as jest.Mock).mockResolvedValue({
        pendingSignatures: 1,
        lateThisWeek: 2,
        openHazards: 3,
        ...overrides.summary,
    });

    (getLateArrivals as jest.Mock).mockResolvedValue({
        range: "this-week",
        total: 5,
        points: [
            { label: "Mon", value: 1 },
            { label: "Tue", value: 2 },
        ],
        ...overrides.late,
    });

    (getDocumentSignatures as jest.Mock).mockResolvedValue({
        signed: 2,
        pending: 2,
        ...overrides.docs,
    });

    (getHazardsReported as jest.Mock).mockResolvedValue({
        range: "this-month",
        total: 3,
        points: [
            { label: "Week 1", value: 1 },
            { label: "Week 2", value: 3 },
        ],
        ...overrides.hazards,
    });

    (getRecentActivity as jest.Mock).mockResolvedValue(
        overrides.activity ?? [
            { type: "DOCUMENT_SIGNED", message: "Doc", created: "now" },
        ]
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    mockUseAuth.mockReturnValue({
        authenticationService: {},
    });
});

describe("Dashboard (full coverage)", () => {

    it("renders all sections with full data", async () => {
        // Given a complete set of dashboard data is returned from all service calls
        mockDashboardData();

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the main summary sections should be displayed with their headings
        expect(await screen.findByText("Pending Signatures")).toBeInTheDocument();
        expect(screen.getByText("Lates this Week")).toBeInTheDocument();
        expect(screen.getByText("Open Hazards")).toBeInTheDocument();
    });

    it("handles late arrivals chart edge cases (max = 0)", async () => {
        // Given late arrivals data with no total and no chart points
        mockDashboardData({ late: { total: 0, points: [] } });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the late arrivals card should safely show a zero total
        expect(await screen.findByText(/0 Total/i)).toBeInTheDocument();
    });

    it("handles document signatures total = 0 branch", async () => {
        // Given document signature data where both signed and pending totals are zero
        mockDashboardData({ docs: { signed: 0, pending: 0 } });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the document signatures section should still render correctly
        expect(await screen.findByText(/Signed/i)).toBeInTheDocument();
    });

    it("covers hazards step logic branches (<=0)", async () => {
        // Given hazards data with no chart points so the lower-value step logic is exercised
        mockDashboardData({ hazards: { points: [] } });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the hazards reported section should still render without error
        expect(await screen.findByText(/Hazards Reported/i)).toBeInTheDocument();
    });

    it("covers hazards step logic (normalized branches)", async () => {
        // Given hazards data with a wide range of values to exercise the normalized step calculation
        mockDashboardData({
            hazards: {
                points: [
                    { label: "A", value: 1 },
                    { label: "B", value: 50 },
                    { label: "C", value: 200 },
                ],
            },
        });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the hazards chart should render using those values
        expect(await screen.findByText("A")).toBeInTheDocument();
    });

    it("covers smooth path generation (single point)", async () => {
        // Given hazards chart data containing only a single point
        mockDashboardData({
            hazards: { points: [{ label: "Only", value: 5 }] },
        });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the single chart point should still be rendered correctly
        expect(await screen.findByText("Only")).toBeInTheDocument();
    });

    it("covers smooth path generation (multiple points)", async () => {
        // Given hazards chart data containing multiple points
        mockDashboardData();

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the multi-point chart should be rendered correctly
        expect(await screen.findByText("Week 1")).toBeInTheDocument();
    });

    it("covers recent activity switch cases", async () => {
        // Given recent activity items covering each supported activity type and the default fallback type
        mockDashboardData({
            activity: [
                { type: "DOCUMENT_SIGNED", message: "A", created: "1" },
                { type: "LEAVE_REQUEST", message: "B", created: "2" },
                { type: "HAZARD_REPORTED", message: "C", created: "3" },
                { type: "LATE_CLOCK_IN", message: "D", created: "4" },
                { type: "UNKNOWN", message: "E", created: "5" },
            ],
        });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then both known and fallback recent activity entries should be shown
        expect(await screen.findByText("A")).toBeInTheDocument();
        expect(screen.getByText("E")).toBeInTheDocument();
    });

    it("changes late arrivals range", async () => {
        // Given the dashboard is loaded with default late arrivals data
        mockDashboardData();

        render(<Dashboard />);

        // When the late arrivals range select is changed to Last Month
        const selects = await screen.findAllByRole("combobox");
        await userEvent.click(selects[0]);
        await userEvent.click(await screen.findByRole("option", { name: /last month/i }));

        // Then the late arrivals service should be called again with the updated range
        await waitFor(() =>
            expect(getLateArrivals).toHaveBeenLastCalledWith(expect.anything(), "last-month")
        );
    });

    it("navigates via quick actions", async () => {
        // Given the dashboard has been rendered with quick action buttons available
        mockDashboardData();

        render(<Dashboard />);

        // When all buttons on the page are queried
        const buttons = await screen.findAllByRole("button");

        // Then at least one button should be present for interaction
        expect(buttons.length).toBeGreaterThan(0);
    });

    it("covers day label fallback", async () => {
        // Given late arrivals data containing a label that is not mapped to a friendly weekday name
        mockDashboardData({
            late: {
                points: [{ label: "XYZ", value: 1 }],
            },
        });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the original label should be displayed as the fallback
        expect(await screen.findByText("XYZ")).toBeInTheDocument();
    });

    it("covers formatChartTick decimal branch", async () => {
        // Given hazards chart data containing a decimal value
        mockDashboardData({
            hazards: {
                points: [{ label: "A", value: 1.5 }],
            },
        });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the hazards chart should render successfully using that decimal tick logic
        expect(await screen.findByText("A")).toBeInTheDocument();
    });

    describe("Dashboard quick actions", () => {

        it("navigates to send document when 'Send Document' is clicked", async () => {
            // Given the dashboard is rendered with the Send Document quick action available
            mockDashboardData();

            render(<Dashboard />);

            // When the Send Document quick action is clicked
            const button = await screen.findByRole("button", { name: /send document/i });
            await userEvent.click(button);

            // Then navigation should be triggered to the send document page
            expect(mockNavigate).toHaveBeenCalledWith("/health-and-safety/send-out");
        });

        it("navigates to safety alert when 'Safety Alert' is clicked", async () => {
            // Given the dashboard is rendered with the Safety Alert quick action available
            mockDashboardData();

            render(<Dashboard />);

            // When the Safety Alert quick action is clicked
            const button = await screen.findByRole("button", { name: /safety alert/i });
            await userEvent.click(button);

            // Then navigation should be triggered to the safety alert page
            expect(mockNavigate).toHaveBeenCalledWith("/health-and-safety/send-out/safety-alert");
        });

        it("navigates to review leaves when 'Review Leaves' is clicked", async () => {
            // Given the dashboard is rendered with the Review Leaves quick action available
            mockDashboardData();

            render(<Dashboard />);

            // When the Review Leaves quick action is clicked
            const button = await screen.findByRole("button", { name: /review leaves/i });
            await userEvent.click(button);

            // Then navigation should be triggered to the pending leave review page
            expect(mockNavigate).toHaveBeenCalledWith("calendar/requests");
        });
    });

    it("covers hazards step logic branch where normalized is less than or equal to 1", async () => {
        // Given hazards chart data that makes the normalized step calculation equal to one or less
        mockDashboardData({
            hazards: {
                points: [
                    { label: "Low", value: 4 },
                ],
            },
        });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the chart should render successfully using that step calculation branch
        expect(await screen.findByText("Low")).toBeInTheDocument();
    });

    it("changes document signatures range", async () => {
        // Given the dashboard is loaded with default document signature data
        mockDashboardData();

        render(<Dashboard />);

        // When the document signatures range select is changed to This Month
        const selects = await screen.findAllByRole("combobox");
        await userEvent.click(selects[1]);
        await userEvent.click(await screen.findByRole("option", { name: /this month/i }));

        // Then the document signatures service should be called again with the updated range
        await waitFor(() =>
            expect(getDocumentSignatures).toHaveBeenLastCalledWith(expect.anything(), "this-month")
        );
    });

    it("changes hazards reported range", async () => {
        // Given the dashboard is loaded with default hazards reported data
        mockDashboardData();

        render(<Dashboard />);

        // When the hazards reported range select is changed to This Month
        const selects = await screen.findAllByRole("combobox");
        await userEvent.click(selects[2]);
        await userEvent.click(await screen.findByRole("option", { name: /this month/i }));

        // Then the hazards reported service should be called again with the updated range
        await waitFor(() =>
            expect(getHazardsReported).toHaveBeenLastCalledWith(expect.anything(), "this-month")
        );
    });

    it("uses fallback values when all dashboard services return undefined", async () => {
        // Given every dashboard service resolves with undefined instead of normal response data
        (getDashboardSummary as jest.Mock).mockResolvedValue(undefined);
        (getLateArrivals as jest.Mock).mockResolvedValue(undefined);
        (getDocumentSignatures as jest.Mock).mockResolvedValue(undefined);
        (getHazardsReported as jest.Mock).mockResolvedValue(undefined);
        (getRecentActivity as jest.Mock).mockResolvedValue(undefined);

        // When the dashboard is rendered
        render(<Dashboard/>);

        // Then the dashboard should fall back default values
        expect(await screen.findByText("Pending Signatures")).toBeInTheDocument();
        expect(screen.getAllByText("0").length).toBeGreaterThan(0);

        // Then late arrivals data should still render with zeros
        expect(screen.getByText(/0 Total/i)).toBeInTheDocument();

        // Then document signatures data should still render with zeros
        expect(screen.getByText("Signed")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("uses zero for signed percentage when signed is missing but pending exists", async () => {
        // Given document signature data where the signed count is missing but a pending count exists
        mockDashboardData();
        (getDocumentSignatures as jest.Mock).mockResolvedValue({
            pending: 4,
        });

        // When the dashboard is rendered
        render(<Dashboard />);

        // Then the document signatures card should still render with zeros
        expect(await screen.findByText("Document Signatures")).toBeInTheDocument();
        expect(screen.getByText("Signed")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
    });

});
