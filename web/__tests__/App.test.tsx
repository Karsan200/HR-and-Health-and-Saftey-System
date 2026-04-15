import { render, screen, act } from "@testing-library/react";
import App from "../src/App";

// ── Mock only AuthContext to avoid auth complexity ───────────────────────────
jest.mock("../src/AuthContext", () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock child components used by AppContent so this test stays focused on App sizing logic
jest.mock("../src/components/Navbar", () => ({
    Navbar: () => <div data-testid="navbar" />,
}));

jest.mock("../src/pages/Dashboard", () => ({
    Dashboard: () => <div data-testid="dashboard" />,
}));

jest.mock("../src/pages/EmployeeOverview", () => ({
    EmployeeOverview: () => <div data-testid="employee-overview" />,
}));

jest.mock("../src/pages/SendOutDocumentsPage", () => ({
    SendOutDocumentsPage: () => <div data-testid="send-out-documents-page" />,
}));

function setWindowWidth(width: number) {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
    act(() => { window.dispatchEvent(new Event("resize")); });
}

describe("App — IncompatibleScreen", () => {
    afterEach(() => {
        setWindowWidth(1024);
    });

    it("shows IncompatibleScreen when the window width is below 768px", () => {
        setWindowWidth(767);
        render(<App />);
        expect(screen.getByText(/incompatible device/i)).toBeInTheDocument();
    });

    it("does not show IncompatibleScreen when the window width is 768px or above", () => {
        setWindowWidth(768);
        render(<App />);
        expect(screen.queryByText(/incompatible device/i)).not.toBeInTheDocument();
    });

    it("shows IncompatibleScreen after resizing down below 768px", () => {
        setWindowWidth(1024);
        render(<App />);
        expect(screen.queryByText(/incompatible device/i)).not.toBeInTheDocument();

        setWindowWidth(480);
        expect(screen.getByText(/incompatible device/i)).toBeInTheDocument();
    });

    it("hides IncompatibleScreen after resizing back up to 768px or above", () => {
        setWindowWidth(480);
        render(<App />);
        expect(screen.getByText(/incompatible device/i)).toBeInTheDocument();

        setWindowWidth(1024);
        expect(screen.queryByText(/incompatible device/i)).not.toBeInTheDocument();
    });
});
