import {
    getPendingSignatures,
    getRiskAssessments,
    getHazardsForRiskAssessment,
    getHazardById,
} from "../../src/logic/ReviewSubmissionsService";
import type { AuthenticationService } from "../../src/logic/AuthenticationService";

const mockFetch = jest.fn();

const mockAuthService = {
    fetch: mockFetch,
} as unknown as AuthenticationService;

beforeEach(() => {
    jest.clearAllMocks();
});

function makeResponse(ok: boolean, body: unknown = {}) {
    return {
        ok,
        json: jest.fn().mockResolvedValue(body),
    };
}

describe("getPendingSignatures", () => {
    it("calls the correct endpoint with GET", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(true, []));
        await getPendingSignatures(mockAuthService);
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/documents/admin/pending-signatures",
            { method: "GET" }
        );
    });

    it("returns parsed JSON on success", async () => {
        const data = [{ accountId: 1, fullName: "John Doe", documentId: 10, documentTitle: "Policy", sentDate: "2026-01-01" }];
        mockFetch.mockResolvedValueOnce(makeResponse(true, data));
        const result = await getPendingSignatures(mockAuthService);
        expect(result).toEqual(data);
    });

    it("throws when response is not ok", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(false));
        await expect(getPendingSignatures(mockAuthService)).rejects.toThrow("Failed to fetch pending signatures");
    });
});

describe("getRiskAssessments", () => {
    it("calls the correct endpoint with GET", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(true, []));
        await getRiskAssessments(mockAuthService);
        expect(mockFetch).toHaveBeenCalledWith("/api/risk-assessment/all", { method: "GET" });
    });

    it("returns parsed JSON on success", async () => {
        const data = [{ riskAssessmentId: 1, title: "Fire Safety", activeHazardCount: 3, created: "2026-01-01", allActionsComplete: false }];
        mockFetch.mockResolvedValueOnce(makeResponse(true, data));
        const result = await getRiskAssessments(mockAuthService);
        expect(result).toEqual(data);
    });

    it("throws when response is not ok", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(false));
        await expect(getRiskAssessments(mockAuthService)).rejects.toThrow("Failed to fetch risk assessments");
    });
});

describe("getHazardsForRiskAssessment", () => {
    it("calls the correct endpoint with the risk assessment id", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(true, []));
        await getHazardsForRiskAssessment(mockAuthService, 5);
        expect(mockFetch).toHaveBeenCalledWith("/api/risk-assessment/5/hazards", { method: "GET" });
    });

    it("returns parsed JSON on success", async () => {
        const data = [{ hazardId: 1, title: "Slippery Floor", createdBy: "John Doe", draft: false, closed: false, created: "2026-01-01", ownedByCurrentUser: true }];
        mockFetch.mockResolvedValueOnce(makeResponse(true, data));
        const result = await getHazardsForRiskAssessment(mockAuthService, 5);
        expect(result).toEqual(data);
    });

    it("throws when response is not ok", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(false));
        await expect(getHazardsForRiskAssessment(mockAuthService, 5)).rejects.toThrow("Failed to fetch hazards");
    });
});

describe("getHazardById", () => {
    it("calls the correct endpoint with the hazard id", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(true, {}));
        await getHazardById(mockAuthService, 99);
        expect(mockFetch).toHaveBeenCalledWith("/api/risk-assessment/hazard/99", { method: "GET" });
    });

    it("returns parsed JSON on success", async () => {
        const data = { hazardId: 99, title: "Gas Leak", createdBy: "Jane Smith", created: "2026-01-01", fileUrls: [], closed: false };
        mockFetch.mockResolvedValueOnce(makeResponse(true, data));
        const result = await getHazardById(mockAuthService, 99);
        expect(result).toEqual(data);
    });

    it("throws when response is not ok", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(false));
        await expect(getHazardById(mockAuthService, 99)).rejects.toThrow("Failed to fetch hazard");
    });
});