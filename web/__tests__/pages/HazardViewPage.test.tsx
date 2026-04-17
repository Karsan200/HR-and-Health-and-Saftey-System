import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { HazardViewPage } from "../../src/pages/HazardViewPage";
import { useAuth } from "../../src/AuthContext";
import { getHazardById } from "../../src/logic/ReviewSubmissionsService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/ReviewSubmissionsService", () => ({
    getHazardById: jest.fn(),
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
const mockGetHazardById = getHazardById as jest.Mock;
const mockAuthService = { fetch: jest.fn() };

const mockHazard = {
    hazardId: 1,
    title: "Gas Leak",
    questionOne: "Leaking gas pipe",
    questionTwo: "All staff nearby",
    questionThree: "Evacuate building",
    questionFour: "Replace pipe",
    questionFive: "Maintenance team",
    questionSix: "2026-06-01T00:00:00",
    isDraft: false,
    isClosed: false,
    closed: false,
    createdBy: "Jane Smith",
    created: "2026-03-15T10:00:00",
    fileUrls: [],
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockGetHazardById.mockResolvedValue(mockHazard);
});

function renderPage(id = "1") {
    return render(
        <MemoryRouter initialEntries={[`/health-and-safety/review/hazard/${id}`]}>
            <Routes>
                <Route path="/health-and-safety/review/hazard/:id" element={<HazardViewPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("HazardViewPage", () => {

    describe("initial render", () => {
        it("calls getHazardById with the id from the route", async () => {
            renderPage("99");
            await waitFor(() =>
                expect(mockGetHazardById).toHaveBeenCalledWith(mockAuthService, 99)
            );
        });

        it("renders the Assessment Information heading", async () => {
            renderPage();
            expect(await screen.findByText("Assessment Information")).toBeInTheDocument();
        });

        it("renders the Hazard detail heading", async () => {
            renderPage();
            expect(await screen.findByText("Hazard")).toBeInTheDocument();
        });
    });

    describe("hazard content", () => {
        it("renders the hazard title", async () => {
            renderPage();
            expect(await screen.findByText("Gas Leak")).toBeInTheDocument();
        });

        it("renders the created by name", async () => {
            renderPage();
            expect(await screen.findByText("Jane Smith")).toBeInTheDocument();
        });

        it("renders the submitted date in DD/MM/YYYY format", async () => {
            renderPage();
            expect(await screen.findByText("15/03/2026")).toBeInTheDocument();
        });

        it("renders question one answer", async () => {
            renderPage();
            expect(await screen.findByText("Leaking gas pipe")).toBeInTheDocument();
        });

        it("renders question five answer", async () => {
            renderPage();
            expect(await screen.findByText("Maintenance team")).toBeInTheDocument();
        });

        it("renders questionSix formatted as DD/MM/YYYY", async () => {
            renderPage();
            expect(await screen.findByText("01/06/2026")).toBeInTheDocument();
        });

        it("renders '—' when questionSix is null", async () => {
            mockGetHazardById.mockResolvedValue({ ...mockHazard, questionSix: null });
            renderPage();
            expect(await screen.findByText("—")).toBeInTheDocument();
        });

        it("shows unchecked checkbox when action is not complete", async () => {
            renderPage();
            await screen.findByText("Action completed");
            expect(screen.queryByTestId("CheckBoxRoundedIcon")).not.toBeInTheDocument();
        });

        it("does not render the photos section when fileUrls is empty", async () => {
            renderPage();
            await screen.findByText("Gas Leak");
            expect(screen.queryByText("Photos")).not.toBeInTheDocument();
        });

        it("renders photo images when fileUrls is populated", async () => {
            mockGetHazardById.mockResolvedValue({
                ...mockHazard,
                fileUrls: ["https://example.com/photo1.jpg"],
            });
            renderPage();
            expect(await screen.findByText("Photos")).toBeInTheDocument();
            const img = screen.getByRole("img");
            expect(img).toHaveAttribute("src", "https://example.com/photo1.jpg");
        });
    });

    describe("error state", () => {
        it("shows an error message when loading fails", async () => {
            mockGetHazardById.mockRejectedValueOnce(new Error("Network error"));
            renderPage();
            expect(await screen.findByText("Failed to load hazard. Please try again.")).toBeInTheDocument();
        });

        it("does not show hazard content when there is an error", async () => {
            mockGetHazardById.mockRejectedValueOnce(new Error("Network error"));
            renderPage();
            await waitFor(() =>
                expect(screen.queryByText("Assessment Information")).not.toBeInTheDocument()
            );
        });
    });

    describe("back button", () => {
        it("navigates back when the back button is clicked", async () => {
            renderPage();
            await screen.findByText("Assessment Information");
            const backButton = screen.getByRole("button");
            await userEvent.click(backButton);
            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });
    });

    it("shows checked checkbox when action is complete", async () => {
        mockGetHazardById.mockResolvedValue({
            ...mockHazard,
            closed: true,
        });

        renderPage();

        await screen.findByText("Action completed");

        expect(screen.getByTestId("CheckBoxRoundedIcon")).toBeInTheDocument();
    });

    function renderWithoutId() {
        return render(
            <MemoryRouter initialEntries={["/health-and-safety/review/hazard/"]}>
                <Routes>
                    <Route path="/health-and-safety/review/hazard/" element={<HazardViewPage />} />
                </Routes>
            </MemoryRouter>
        );
    }

    it("does not call getHazardById when id is missing", async () => {
        renderWithoutId();

        await waitFor(() => {
            expect(mockGetHazardById).not.toHaveBeenCalled();
        });
    });
});