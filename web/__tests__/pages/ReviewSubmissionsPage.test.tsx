import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { ReviewSubmissionsPage } from "../../src/pages/ReviewSubmissionsPage";
import { useAuth } from "../../src/AuthContext";
import { getPendingSignatures, getRiskAssessments } from "../../src/logic/ReviewSubmissionsService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/ReviewSubmissionsService", () => ({
    getPendingSignatures: jest.fn(),
    getRiskAssessments: jest.fn(),
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
const mockGetPendingSignatures = getPendingSignatures as jest.Mock;
const mockGetRiskAssessments = getRiskAssessments as jest.Mock;
const mockAuthService = { fetch: jest.fn() };

const mockSignature = {
    accountId: 1,
    fullName: "John Doe",
    documentId: 10,
    documentTitle: "Fire Safety Policy",
    sentDate: "2026-02-05T10:00:00",
};

const mockAssessment = {
    riskAssessmentId: 1,
    title: "Fire Safety",
    activeHazardCount: 3,
    created: "2026-01-15T08:00:00",
    allActionsComplete: false,
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockGetPendingSignatures.mockResolvedValue([]);
    mockGetRiskAssessments.mockResolvedValue([]);
});

function renderPage() {
    return render(
        <MemoryRouter>
            <ReviewSubmissionsPage />
        </MemoryRouter>
    );
}

describe("ReviewSubmissionsPage", () => {

    describe("initial render", () => {
        it("renders the Document Signatures section heading", async () => {
            renderPage();
            expect(await screen.findByText("Document Signatures")).toBeInTheDocument();
        });

        it("renders the Risk Assessments section heading", async () => {
            renderPage();
            expect(await screen.findByText("Risk Assessments")).toBeInTheDocument();
        });

        it("calls getPendingSignatures on mount", async () => {
            renderPage();
            await waitFor(() => expect(mockGetPendingSignatures).toHaveBeenCalledTimes(1));
        });

        it("calls getRiskAssessments on mount", async () => {
            renderPage();
            await waitFor(() => expect(mockGetRiskAssessments).toHaveBeenCalledTimes(1));
        });
    });

    describe("empty states", () => {
        it("shows 'All signatures are up to date' when there are no pending signatures", async () => {
            renderPage();
            expect(await screen.findByText("All signatures are up to date")).toBeInTheDocument();
        });

        it("shows 'No risk assessments found' when there are no assessments", async () => {
            renderPage();
            expect(await screen.findByText("No risk assessments found")).toBeInTheDocument();
        });
    });

    describe("error state", () => {
        it("shows an error message when loading fails", async () => {
            mockGetPendingSignatures.mockRejectedValueOnce(new Error("Network error"));
            renderPage();
            expect(await screen.findByText("Failed to load data. Please try again.")).toBeInTheDocument();
        });

        it("does not show signature list content when there is an error", async () => {
            mockGetPendingSignatures.mockRejectedValueOnce(new Error("Network error"));
            renderPage();
            await waitFor(() =>
                expect(screen.queryByText("All signatures are up to date")).not.toBeInTheDocument()
            );
        });
    });

    describe("pending signatures list", () => {
        beforeEach(() => {
            mockGetPendingSignatures.mockResolvedValue([mockSignature]);
        });

        it("renders the full name of the person who has not signed", async () => {
            renderPage();
            expect(await screen.findByText("John Doe")).toBeInTheDocument();
        });

        it("renders the document title", async () => {
            renderPage();
            expect(await screen.findByText("Fire Safety Policy")).toBeInTheDocument();
        });

        it("renders the sent date in 'Sent: D Month YYYY' format", async () => {
            renderPage();
            expect(await screen.findByText("Sent: 5 February 2026")).toBeInTheDocument();
        });

        it("renders the Pending badge", async () => {
            renderPage();
            expect(await screen.findByText("Pending")).toBeInTheDocument();
        });
    });

    describe("risk assessments list", () => {
        beforeEach(() => {
            mockGetRiskAssessments.mockResolvedValue([mockAssessment]);
        });

        it("renders the risk assessment title", async () => {
            renderPage();
            expect(await screen.findByText("Fire Safety")).toBeInTheDocument();
        });

        it("renders the active hazard count", async () => {
            renderPage();
            expect(await screen.findByText("3 hazards identified")).toBeInTheDocument();
        });

        it("renders the submitted date in 'Submitted: D Month YYYY' format", async () => {
            renderPage();
            expect(await screen.findByText("Submitted: 15 January 2026")).toBeInTheDocument();
        });

        it("shows 'Review now' button when actions are not complete", async () => {
            renderPage();
            expect(await screen.findByText("Review now")).toBeInTheDocument();
        });

        it("shows 'Read again' button when all actions are complete", async () => {
            mockGetRiskAssessments.mockResolvedValue([{ ...mockAssessment, allActionsComplete: true }]);
            renderPage();
            expect(await screen.findByText("Read again")).toBeInTheDocument();
        });

        it("navigates to the risk assessment detail page when the button is clicked", async () => {
            renderPage();
            const button = await screen.findByText("Review now");
            await userEvent.click(button);
            expect(mockNavigate).toHaveBeenCalledWith("/health-and-safety/review/risk-assessment/1");
        });
    });
});