import {
    sendOutDocument,
    stripPdfExtension,
    type SendOutDocumentPayload,
} from "../../src/logic/SendOutDocumentsService";
import type { AuthenticationService } from "../../src/logic/AuthenticationService";

const mockFetch = jest.fn();

const mockAuthService: jest.Mocked<AuthenticationService> = {
    fetch: mockFetch,
    auth: {} as never,
    refresh: jest.fn(),
    mfaTotp: jest.fn(),
    login: jest.fn(),
};

// Simulate FileReader reading a file as base64
beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(global, "FileReader", {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
            readAsDataURL: jest.fn(function () {
                this.onload?.();
            }),
            result: "data:application/pdf;base64,dGVzdA==",
        })),
    });
});

function makeMockResponse(ok: boolean, text = "") {
    return {
        ok,
        text: jest.fn().mockResolvedValue(text),
    };
}

function makePdfFile(name = "test.pdf"): File {
    return new File(["content"], name, { type: "application/pdf" });
}

function makePayload(overrides: Partial<SendOutDocumentPayload> = {}): SendOutDocumentPayload {
    return {
        title: "Fire Safety Policy",
        category: "policy",
        requireSignature: true,
        file: makePdfFile(),
        recipientIds: [],
        version: null,
        ...overrides,
    };
}

describe("stripPdfExtension", () => {

    it("strips a lowercase .pdf extension", () => {
        expect(stripPdfExtension("document.pdf")).toBe("document");
    });

    it("strips an uppercase .PDF extension", () => {
        expect(stripPdfExtension("document.PDF")).toBe("document");
    });

    it("strips a mixed-case .Pdf extension", () => {
        expect(stripPdfExtension("document.Pdf")).toBe("document");
    });

    it("does not strip a non-pdf extension", () => {
        expect(stripPdfExtension("document.docx")).toBe("document.docx");
    });

    it("does not alter a name with no extension", () => {
        expect(stripPdfExtension("document")).toBe("document");
    });

    it("only strips a trailing .pdf, not one mid-name", () => {
        expect(stripPdfExtension("my.pdf.document")).toBe("my.pdf.document");
    });
});

describe("sendOutDocument", () => {

    describe("handbook title validation", () => {

        it("throws if handbook title does not contain 'handbook'", async () => {
            await expect(
                sendOutDocument(makePayload({ category: "handbook", title: "Fire Safety" }), mockAuthService)
            ).rejects.toThrow("Handbook documents must include the word 'handbook' in the title.");
        });

        it("does not throw if handbook title contains 'handbook'", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await expect(
                sendOutDocument(makePayload({ category: "handbook", title: "Staff Handbook" }), mockAuthService)
            ).resolves.toBeUndefined();
        });

        it("is case-insensitive for the handbook title check", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await expect(
                sendOutDocument(makePayload({ category: "handbook", title: "STAFF HANDBOOK 2026" }), mockAuthService)
            ).resolves.toBeUndefined();
        });
    });

    describe("version appending", () => {

        it("appends 'v' + version to the title for a policy", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload({ title: "Fire Safety", version: "1.0" }), mockAuthService);

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.title).toBe("Fire Safety v1.0");
        });

        it("appends 'v' + version to the title for an SOP", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload({ title: "Forklift SOP", category: "sop", version: "2.5" }), mockAuthService);

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.title).toBe("Forklift SOP v2.5");
        });

        it("appends version without 'v' prefix for a handbook", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload({ title: "Staff Handbook", category: "handbook", version: "2026" }), mockAuthService);

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.title).toBe("Staff Handbook 2026");
        });

        it("does not append anything to the title when version is null", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload({ title: "Fire Safety", version: null }), mockAuthService);

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.title).toBe("Fire Safety");
        });
    });

    describe("request body", () => {

        it("sends to the correct endpoint with POST", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload(), mockAuthService);

            expect(mockFetch).toHaveBeenCalledWith(
                "/api/documents/admin/send-out",
                expect.objectContaining({ method: "POST" })
            );
        });

        it("sets Content-Type to application/json", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload(), mockAuthService);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: { "Content-Type": "application/json" },
                })
            );
        });

        it("includes the correct category and requireSignature in the body", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload({ category: "sop", requireSignature: false }), mockAuthService);

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.category).toBe("sop");
            expect(body.requireSignature).toBe(false);
        });

        it("includes recipientIds in the body", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload({ recipientIds: [1, 2, 3] }), mockAuthService);

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.recipientIds).toEqual([1, 2, 3]);
        });

        it("strips trailing .pdf from the title before sending", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload({ title: "Fire Safety.pdf" }), mockAuthService);

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.title).toBe("Fire Safety");
        });

        it("trims whitespace from the title before sending", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await sendOutDocument(makePayload({ title: "  Fire Safety  " }), mockAuthService);

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(body.title).toBe("Fire Safety");
        });
    });

    describe("response handling", () => {

        it("resolves successfully when the response is ok", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(true));

            await expect(sendOutDocument(makePayload(), mockAuthService)).resolves.toBeUndefined();
        });

        it("throws with the response text when the response is not ok", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse(false, "Bad Request"));

            await expect(sendOutDocument(makePayload(), mockAuthService))
                .rejects.toThrow("Upload failed: Bad Request");
        });

        it("throws with 'Unknown error' when the response text cannot be read", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: jest.fn().mockRejectedValue(new Error("read error")),
            });

            await expect(sendOutDocument(makePayload(), mockAuthService))
                .rejects.toThrow("Upload failed: Unknown error");
        });
    });
});