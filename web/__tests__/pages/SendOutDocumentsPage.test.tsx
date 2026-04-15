import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { SendOutDocumentsPage } from "../../src/pages/SendOutDocumentsPage";
import { useAuth } from "../../src/AuthContext";
import { sendOutDocument } from "../../src/logic/SendOutDocumentsService";
import { getEmployees } from "../../src/logic/EmployeeOverviewService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/SendOutDocumentsService", () => ({
    ...jest.requireActual("../../src/logic/SendOutDocumentsService"),
    sendOutDocument: jest.fn(),
}));
jest.mock("../../src/logic/EmployeeOverviewService", () => ({
    getEmployees: jest.fn(),
}));
jest.mock("../../src/components/SectionNavbar", () => ({
    SectionNavBar: () => <div />,
}));

const mockUseAuth = useAuth as jest.Mock;
const mockSendOutDocument = sendOutDocument as jest.Mock;
const mockGetEmployees = getEmployees as jest.Mock;
const mockAuthService = { fetch: jest.fn() };

beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ authenticationService: mockAuthService });
    mockGetEmployees.mockResolvedValue([]);
    mockSendOutDocument.mockResolvedValue(undefined);
});

function renderPage() {
    return render(
        <MemoryRouter>
            <SendOutDocumentsPage />
        </MemoryRouter>
    );
}

function makePdfFile(name = "fire-safety.pdf"): File {
    return new File(["content"], name, { type: "application/pdf" });
}

async function uploadFile(file: File) {
    const input = document.querySelector<HTMLInputElement>("input[type='file']")!;
    await userEvent.upload(input, file);
}

async function openCategoryDropdown() {
    const dropdown = screen.getAllByRole("combobox")[0];
    await userEvent.click(dropdown);
}

/**
 * FIX: missing helper causing TS2552
 * Assumption based on test structure:
 * - first combobox = category
 * - second combobox = send-to dropdown
 */
function getSendToDropdown() {
    const combos = screen.getAllByRole("combobox");
    return combos[1];
}

async function fillAndSubmit(overrides: { title?: string; version?: string } = {}) {
    await uploadFile(makePdfFile());

    const titleInput = screen.getByLabelText(/document title/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, overrides.title ?? "Fire Safety Policy");

    if (overrides.version !== undefined) {
        const versionInput = screen.getByLabelText(/version/i);
        await userEvent.clear(versionInput);
        await userEvent.type(versionInput, overrides.version);
    }

    await userEvent.click(
        screen.getByRole("button", { name: /upload and send now/i })
    );
}

describe("SendOutDocumentsPage", () => {

    describe("initial render", () => {

        it("renders the document title input", () => {
            renderPage();
            expect(screen.getByLabelText(/document title/i)).toBeInTheDocument();
        });

        it("renders the version input", () => {
            renderPage();
            expect(screen.getByLabelText(/version/i)).toBeInTheDocument();
        });

        it("renders the submit button", () => {
            renderPage();
            expect(screen.getByRole("button", { name: /upload and send now/i })).toBeInTheDocument();
        });

        it("renders the require signature checkbox checked by default", () => {
            renderPage();
            expect(screen.getByRole("checkbox")).toBeChecked();
        });

        it("calls getEmployees on mount", async () => {
            renderPage();
            await waitFor(() => expect(mockGetEmployees).toHaveBeenCalledTimes(1));
        });
    });

    describe("file upload", () => {

        it("pre-fills the title from the filename when the title is empty", async () => {
            renderPage();
            await uploadFile(makePdfFile("working-at-height.pdf"));
            expect(screen.getByLabelText(/document title/i)).toHaveValue("working-at-height");
        });

        it("does not overwrite a title the user has already typed", async () => {
            renderPage();
            await userEvent.type(screen.getByLabelText(/document title/i), "My Custom Title");
            await uploadFile(makePdfFile("other-file.pdf"));
            expect(screen.getByLabelText(/document title/i)).toHaveValue("My Custom Title");
        });

        it("shows an error for a file that exceeds the size limit", async () => {
            renderPage();
            const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "big.pdf", {type: "application/pdf"});
            await uploadFile(bigFile);

            expect(
                await screen.findByText(/file must be under 10 mb/i)
            ).toBeInTheDocument();
        });

        it("handles drag over and drop events correctly", async () => {
            renderPage();

            const dropZone = screen
                .getByText(/click to upload or drag and drop/i)
                .closest("div")!;

            const file = new File(["content"], "test.pdf", {type: "application/pdf"});

            fireEvent.dragOver(dropZone);

            fireEvent.drop(dropZone, {
                dataTransfer: {
                    files: [file],
                    items: [
                        {
                            kind: "file",
                            type: file.type,
                            getAsFile: () => file,
                        },
                    ],
                },
            });

            expect(await screen.findByText("test.pdf")).toBeInTheDocument();
        });

        it("sets form state to submitting while uploading", async () => {
            let resolvePromise: () => void;
            const promise = new Promise<void>((res) => {
                resolvePromise = res;
            });

            mockSendOutDocument.mockReturnValueOnce(promise);

            renderPage();
            await fillAndSubmit();

            expect(screen.getByText(/uploading/i)).toBeInTheDocument();

            resolvePromise!();

            await waitFor(() =>
                expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument()
            );
        });

    });

    describe("form validation", () => {

        it("falls back to empty employees list when getEmployees fails", async () => {
            mockGetEmployees.mockRejectedValueOnce(new Error("fail"));

            renderPage();

            await waitFor(() => {
                expect(mockGetEmployees).toHaveBeenCalled();
            });

            const sendToDropdown = getSendToDropdown();

            await userEvent.click(sendToDropdown);

            await userEvent.click(
                await screen.findByRole("option", { name: /specific employees/i })
            );

            expect(screen.getAllByRole("combobox")[2]).toBeInTheDocument();
        });

        it("shows fallback error message when unknown error occurs", async () => {
            mockSendOutDocument.mockRejectedValueOnce({});

            renderPage();
            await fillAndSubmit();

            expect(
                await screen.findByText(/something went wrong/i)
            ).toBeInTheDocument();
        });
    });

    describe("category behaviour", () => {

        it("disables the require signature checkbox when handbook is selected", async () => {
            renderPage();

            await openCategoryDropdown();
            await userEvent.click(await screen.findByRole("option", { name: /handbook/i }));

            expect(screen.getByRole("checkbox")).toBeDisabled();
        });

        it("updates version placeholder for handbooks", async () => {
            renderPage();

            await openCategoryDropdown();
            await userEvent.click(await screen.findByRole("option", { name: /handbook/i }));

            expect(screen.getByLabelText(/version/i)).toHaveAttribute("placeholder", "e.g. 2026");
        });
    });


    it("shows an error when title is empty on submit", async () => {
        renderPage();
        await uploadFile(makePdfFile());
        await userEvent.clear(screen.getByLabelText(/document title/i));
        await userEvent.click(screen.getByRole("button", { name: /upload and send now/i }));

        expect(await screen.findByText(/please enter a document title/i)).toBeInTheDocument();
    });

    it("requires 'handbook' in the title for handbook category", async () => {
        renderPage();
        await uploadFile(makePdfFile());

        // set category to handbook
        await openCategoryDropdown();
        await userEvent.click(await screen.findByRole("option", { name: /handbook/i }));

        await userEvent.clear(screen.getByLabelText(/document title/i));
        await userEvent.type(screen.getByLabelText(/document title/i), "Safety Policy");

        await userEvent.click(screen.getByRole("button", { name: /upload and send now/i }));

        expect(await screen.findByText(/must include the word 'handbook'/i)).toBeInTheDocument();
    });


    it("shows error for invalid policy version", async () => {
        renderPage();
        await uploadFile(makePdfFile());

        await userEvent.type(screen.getByLabelText(/version/i), "abcd");
        await fillAndSubmit();

        expect(await screen.findByText(/version must be in the format/i)).toBeInTheDocument();
    });

    it("renders selected employees names in multi-select", async () => {
        mockGetEmployees.mockResolvedValueOnce([
            { accountId: 1, fullName: "Alice" },
            { accountId: 2, fullName: "Bob" },
        ]);

        renderPage();

        await waitFor(() => expect(mockGetEmployees).toHaveBeenCalled());

        const sendToDropdown = getSendToDropdown();
        await userEvent.click(sendToDropdown);
        await userEvent.click(await screen.findByRole("option", { name: /specific employees/i }));

        const employeeDropdown = screen.getAllByRole("combobox")[2];
        await userEvent.click(employeeDropdown);

        await userEvent.click(await screen.findByText("Alice"));
        await userEvent.click(await screen.findByText("Bob"));

        expect(employeeDropdown).toHaveTextContent("Alice, Bob");
    });

    describe("file validation", () => {
        it("shows an error when a non-PDF file is dropped onto the drop zone", async () => {
            renderPage();

            const dropZone = screen
                .getByText(/click to upload or drag and drop/i)
                .closest("div")!;

            const nonPdfFile = new File(["content"], "image.png", { type: "image/png" });

            fireEvent.drop(dropZone, {
                dataTransfer: {
                    files: [nonPdfFile],
                    items: [{ kind: "file", type: nonPdfFile.type, getAsFile: () => nonPdfFile }],
                },
            });

            expect(
                await screen.findByText(/only pdf files are accepted/i)
            ).toBeInTheDocument();
        });
    });

    describe("submit without file", () => {
        it("shows an error when submitting with no file selected", async () => {
            renderPage();

            // Type a title so the only missing thing is the file
            await userEvent.type(screen.getByLabelText(/document title/i), "Fire Safety Policy");

            await userEvent.click(
                screen.getByRole("button", { name: /upload and send now/i })
            );

            expect(
                await screen.findByText(/please select a file to upload/i)
            ).toBeInTheDocument();
        });
    });

    describe("require signature checkbox and upload section rendering", () => {
        it("renders the require signature checkbox and it is enabled by default for non-handbook categories", () => {
            renderPage();

            const checkbox = screen.getByRole("checkbox");
            expect(checkbox).toBeInTheDocument();
            expect(checkbox).not.toBeDisabled();
            expect(checkbox).toBeChecked();
        });

        it("unchecking the require signature checkbox updates its state", async () => {
            renderPage();

            const checkbox = screen.getByRole("checkbox");
            await userEvent.click(checkbox);

            expect(checkbox).not.toBeChecked();
        });

        it("renders the Upload File label", () => {
            renderPage();
            expect(screen.getByText(/upload file/i)).toBeInTheDocument();
        });

        it("renders the drop zone with click-to-upload prompt", () => {
            renderPage();
            expect(
                screen.getByText(/click to upload or drag and drop/i)
            ).toBeInTheDocument();
        });

        it("clicking the drop zone triggers the hidden file input", async () => {
            renderPage();

            const fileInput = document.querySelector<HTMLInputElement>("input[type='file']")!;
            const clickSpy = jest.spyOn(fileInput, "click");

            const dropZone = screen
                .getByText(/click to upload or drag and drop/i)
                .closest("div")!;

            await userEvent.click(dropZone);

            expect(clickSpy).toHaveBeenCalled();
        });

        it("shows filename and size after a valid file is dropped", async () => {
            renderPage();

            const dropZone = screen
                .getByText(/click to upload or drag and drop/i)
                .closest("div")!;

            const file = new File(["x".repeat(1024)], "manual.pdf", { type: "application/pdf" });

            fireEvent.drop(dropZone, {
                dataTransfer: {
                    files: [file],
                    items: [{ kind: "file", type: file.type, getAsFile: () => file }],
                },
            });

            expect(await screen.findByText("manual.pdf")).toBeInTheDocument();
            expect(await screen.findByText(/mb/i)).toBeInTheDocument();
        });
    });
});