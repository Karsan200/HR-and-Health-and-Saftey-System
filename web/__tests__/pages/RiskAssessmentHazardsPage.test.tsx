import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { RiskAssessmentHazardsPage } from "../../src/pages/RiskAssessmentHazardsPage";
import { useAuth } from "../../src/AuthContext";
import { getHazardsForRiskAssessment } from "../../src/logic/ReviewSubmissionsService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/ReviewSubmissionsService", () => ({
    getHazardsForRiskAssessment: jest.fn(),
}));
jest.mock("../../src/components/SectionNavbar", () => ({
    SectionNavBar: () => <div />,
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

const mockUseAuth = useAuth as jest.Mock;
const mockGetHazards = getHazardsForRiskAssessment as jest.Mock;
const mockAuthService = { fetch: jest.fn() };

const mockHazard = {
    hazardId: 1,
    title: "Slippery Floor",
    createdBy: "John Doe",
    draft: false,
    closed: false,
    created: "2026-03-10T09:00:00",
    ownedByCurrentUser: true,
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockGetHazards.mockResolvedValue([]);
});

function renderPage(id = "1") {
    return render(
        <MemoryRouter initialEntries={[`/health-and-safety/review/risk-assessment/${id}`]}>
            <Routes>
                <Route path="/health-and-safety/review/risk-assessment/:id" element={<RiskAssessmentHazardsPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("RiskAssessmentHazardsPage", () => {

    describe("initial render", () => {
        it("renders the Hazards heading", async () => {
            renderPage();
            expect(await screen.findByText("Hazards")).toBeInTheDocument();
        });

        it("calls getHazardsForRiskAssessment with the id from the route", async () => {
            renderPage("5");
            await waitFor(() =>
                expect(mockGetHazards).toHaveBeenCalledWith(mockAuthService, 5)
            );
        });
    });

    describe("empty state", () => {
        it("shows 'No hazards found' when the list is empty", async () => {
            renderPage();
            expect(await screen.findByText("No hazards found for this assessment")).toBeInTheDocument();
        });
    });

    describe("error state", () => {
        it("shows an error message when loading fails", async () => {
            mockGetHazards.mockRejectedValueOnce(new Error("Network error"));
            renderPage();
            expect(await screen.findByText("Failed to load hazards. Please try again.")).toBeInTheDocument();
        });

        it("does not show the hazard list when there is an error", async () => {
            mockGetHazards.mockRejectedValueOnce(new Error("Network error"));
            renderPage();
            await waitFor(() =>
                expect(screen.queryByText("No hazards found for this assessment")).not.toBeInTheDocument()
            );
        });
    });

    describe("hazard list", () => {
        beforeEach(() => {
            mockGetHazards.mockResolvedValue([mockHazard]);
        });

        it("renders the hazard title", async () => {
            renderPage();
            expect(await screen.findByText("Slippery Floor")).toBeInTheDocument();
        });

        it("renders the creator's name", async () => {
            renderPage();
            expect(await screen.findByText("John Doe")).toBeInTheDocument();
        });

        it("renders the submitted date in 'Submitted: D Month YYYY' format", async () => {
            renderPage();
            expect(await screen.findByText("Submitted: 10 March 2026")).toBeInTheDocument();
        });

        it("shows 'Submitted' status badge for an open hazard", async () => {
            renderPage();
            expect(await screen.findByText("Submitted")).toBeInTheDocument();
        });

        it("shows 'Closed' status badge for a closed hazard", async () => {
            mockGetHazards.mockResolvedValue([{ ...mockHazard, closed: true }]);
            renderPage();
            expect(await screen.findByText("Closed")).toBeInTheDocument();
        });

        it("filters out draft hazards", async () => {
            mockGetHazards.mockResolvedValue([{ ...mockHazard, draft: true }]);
            renderPage();
            await waitFor(() =>
                expect(screen.queryByText("Slippery Floor")).not.toBeInTheDocument()
            );
        });

        it("navigates to the hazard detail page when a hazard row is clicked", async () => {
            renderPage();
            const row = await screen.findByText("Slippery Floor");
            await userEvent.click(row);
            expect(mockNavigate).toHaveBeenCalledWith("/health-and-safety/review/hazard/1");
        });
    });

    describe("back button", () => {
        it("navigates to the review page when the back button is clicked", async () => {
            renderPage();
            await waitFor(() => screen.getByText("Hazards"));
            const backButton = screen.getByRole("button");
            await userEvent.click(backButton);
            expect(mockNavigate).toHaveBeenCalledWith("/health-and-safety/review");
        });
    });
});