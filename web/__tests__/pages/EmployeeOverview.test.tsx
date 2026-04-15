import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cleanup } from "@testing-library/react";

import { EmployeeOverview } from "../../src/pages/EmployeeOverview";
import { useAuth } from "../../src/AuthContext";
import {
    getEmployees,
    getEmployeeOverview,
    sanitiseEmployeeSearch,
} from "../../src/logic/EmployeeOverviewService";

jest.mock("../../src/AuthContext");
jest.mock("../../src/logic/EmployeeOverviewService");

const mockUseAuth = useAuth as jest.Mock;
const mockGetEmployees = getEmployees as jest.Mock;
const mockGetEmployeeOverview = getEmployeeOverview as jest.Mock;
const mockSanitiseEmployeeSearch = sanitiseEmployeeSearch as jest.Mock;

const mockAuthenticationService = {};

function currentMonthLabel() {
    return new Date().toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
    });
}

function previousMonthLabel(offset: number) {
    const baseDate = new Date();
    const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - offset, 1);

    return monthDate.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
    });
}

function makeEmployees() {
    return [
        { accountId: 1, fullName: "John Doe", position: "Admin" },
        { accountId: 2, fullName: "Jane Smith", position: "Manager" },
        { accountId: 3, fullName: "Bob Jones", position: "Employee" },
        { accountId: 4, fullName: "Alice Brown", position: "Employee" },
    ];
}

function makeOverview(overrides = {}) {
    return {
        accountId: 1,
        fullName: "John Doe",
        position: "Admin",
        email: "john@example.com",
        hoursWorkedThisMonth: 40,
        latesThisMonth: 2,
        upcomingLeave: null,
        ...overrides,
    };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
        authenticationService: mockAuthenticationService,
    });

    mockSanitiseEmployeeSearch.mockImplementation((value: string) => value.trim());
    mockGetEmployees.mockResolvedValue([]);
    mockGetEmployeeOverview.mockResolvedValue(makeOverview());
});

function renderEmployeeOverview() {
    return render(<EmployeeOverview />);
}

afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    jest.resetAllMocks();
});


describe("EmployeeOverview", () => {
    describe("initial and empty states", () => {
        it("renders the side panel, search, add button and empty state when no employees are returned", async () => {
            // Given the employee list request succeeds with no employees
            mockGetEmployees.mockResolvedValueOnce([]);

            // When the page is rendered
            renderEmployeeOverview();

            // Then the empty employee list and empty details state should be shown
            expect(await screen.findByText("Employees (0)")).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/search employees/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /add employee/i })).toBeInTheDocument();
            expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
            expect(screen.getAllByText(/select an employee/i)[0]).toBeInTheDocument();
            expect(screen.getByText(/choose an employee from the list/i)).toBeInTheDocument();
            expect(mockGetEmployeeOverview).not.toHaveBeenCalled();
        });

        it("treats an undefined employee list response as an empty array", async () => {
            // Given the employee list request resolves with undefined
            mockGetEmployees.mockResolvedValueOnce(undefined);

            // When the page is rendered
            renderEmployeeOverview();

            // Then it should safely behave as though no employees were returned
            expect(await screen.findByText("Employees (0)")).toBeInTheDocument();
            expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
            expect(mockGetEmployeeOverview).not.toHaveBeenCalled();
        });

        it("shows an error and clears state when loading employees fails", async () => {
            // Given the employee list request fails
            mockGetEmployees.mockRejectedValueOnce(new Error("unknow error"));

            // When the page is rendered
            renderEmployeeOverview();

            // Then the list error and empty state should be shown
            expect(await screen.findByText(/unable to load employees/i)).toBeInTheDocument();
            expect(screen.getByText("Employees (0)")).toBeInTheDocument();
            expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
            expect(screen.getAllByText(/select an employee/i)[0]).toBeInTheDocument();
            expect(mockGetEmployeeOverview).not.toHaveBeenCalled();
        });
    });

    describe("employee list and selection", () => {
        it("selects the first employee by default and renders their details", async () => {
            // Given employees are returned and the first employee overview loads successfully
            mockGetEmployees.mockResolvedValueOnce(makeEmployees().slice(0, 2));
            mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

            // When the page is rendered
            renderEmployeeOverview();

            // Then the first employee should be selected and their details displayed
            expect(await screen.findByText("Employees (2)")).toBeInTheDocument();

            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 1)
            );

            expect(screen.getAllByText("John Doe")[0]).toBeInTheDocument();
            expect(screen.getAllByText("Admin")[0]).toBeInTheDocument();
            expect(screen.getByText("john@example.com")).toBeInTheDocument();
            expect(screen.getByText("40 hours")).toBeInTheDocument();
            expect(screen.getByText("2")).toBeInTheDocument();
            expect(screen.getByText(/no upcoming approved leave/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /edit employee/i })).toBeInTheDocument();
            expect(screen.getByText(/college and learning days/i)).toBeInTheDocument();
            expect(screen.getByText(/payslip management/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument();
        });

        it("loads a different overview when a different employee is clicked", async () => {
            // Given employees are returned and each selected employee has different overview data
            mockGetEmployees.mockResolvedValueOnce(makeEmployees().slice(0, 2));
            mockGetEmployeeOverview
                .mockResolvedValueOnce(makeOverview({
                    accountId: 1,
                    fullName: "John Doe",
                    position: "Admin",
                    email: "john@example.com",
                }))
                .mockResolvedValueOnce(makeOverview({
                    accountId: 2,
                    fullName: "Jane Smith",
                    position: "Manager",
                    email: "jane@example.com",
                }));

            renderEmployeeOverview();

            await screen.findByText("Employees (2)");
            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 1)
            );

            // When the second employee is clicked
            await userEvent.click(screen.getAllByText("Jane Smith")[0]);

            // Then the second employee overview should be requested and rendered
            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 2)
            );

            expect(await screen.findByText("jane@example.com")).toBeInTheDocument();
            expect(screen.getAllByText("Manager")[0]).toBeInTheDocument();
        });

        it("preserves the selected employee when a refreshed list still contains them", async () => {
            // Given an employee is selected and a later search returns a list still containing that employee
            mockGetEmployees
                .mockResolvedValueOnce(makeEmployees().slice(0, 2))
                .mockResolvedValueOnce([
                    { accountId: 2, fullName: "Jane Smith", position: "Manager" },
                    { accountId: 3, fullName: "Bob Jones", position: "Employee" },
                ]);

            mockGetEmployeeOverview
                .mockResolvedValueOnce(makeOverview({
                    accountId: 1,
                    fullName: "John Doe",
                    email: "john@example.com",
                }))
                .mockResolvedValueOnce(makeOverview({
                    accountId: 2,
                    fullName: "Jane Smith",
                    position: "Manager",
                    email: "jane@example.com",
                }))
                .mockResolvedValueOnce(makeOverview({
                    accountId: 2,
                    fullName: "Jane Smith",
                    position: "Manager",
                    email: "jane@example.com",
                }));

            renderEmployeeOverview();

            await screen.findByText("Employees (2)");
            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 1)
            );

            await userEvent.click(screen.getAllByText("Jane Smith")[0]);

            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 2)
            );

            // When the search changes and the refreshed list still contains Jane
            await userEvent.type(screen.getByPlaceholderText(/search employees/i), " jane ");

            // Then the selected employee id should be preserved rather than falling back to the first returned employee
            await waitFor(() =>
                expect(mockGetEmployees).toHaveBeenLastCalledWith(mockAuthenticationService, "jane")
            );

            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenLastCalledWith(mockAuthenticationService, 2)
            );
        });

        it("falls back to the first employee when the current selection no longer exists in a refreshed list", async () => {
            // Given an employee is selected and a later search returns a list no longer containing that employee
            mockGetEmployees
                .mockResolvedValueOnce(makeEmployees().slice(0, 2))
                .mockResolvedValueOnce([
                    { accountId: 3, fullName: "Bob Jones", position: "Employee" },
                    { accountId: 4, fullName: "Alice Brown", position: "Employee" },
                ]);

            mockGetEmployeeOverview
                .mockResolvedValueOnce(makeOverview({
                    accountId: 1,
                    fullName: "John Doe",
                    email: "john@example.com",
                }))
                .mockResolvedValueOnce(makeOverview({
                    accountId: 2,
                    fullName: "Jane Smith",
                    position: "Manager",
                    email: "jane@example.com",
                }))
                .mockResolvedValueOnce(makeOverview({
                    accountId: 3,
                    fullName: "Bob Jones",
                    position: "Employee",
                    email: "bob@example.com",
                }));

            // When the page is rendered and an employee is selected
            renderEmployeeOverview();
            await screen.findByText("Employees (2)");
            await userEvent.click(screen.getAllByText("Jane Smith")[0]);

            // Then the overview for that employee should be shown
            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 2)
            );
            await userEvent.type(screen.getByPlaceholderText(/search employees/i), "bob");
            await waitFor(() =>
                expect(mockGetEmployees).toHaveBeenLastCalledWith(mockAuthenticationService, "bob")
            );
            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenLastCalledWith(mockAuthenticationService, 3)
            );
        });
    });

    describe("search behaviour", () => {
        it("sanitises the search input and uses the sanitised value when fetching employees", async () => {
            // Given the search sanitiser trims and normalises the raw input
            mockSanitiseEmployeeSearch.mockImplementation((value: string) => value.trim().toLowerCase());

            renderEmployeeOverview();

            await screen.findByText("Employees (0)");

            // When the search field is updated
            await userEvent.type(screen.getByPlaceholderText(/search employees/i), "  ALIce  ");

            // Then the sanitiser should receive the raw input and the fetch should use the sanitised result
            expect(mockSanitiseEmployeeSearch).toHaveBeenCalledWith("");
            expect(mockSanitiseEmployeeSearch).toHaveBeenLastCalledWith("  ALIce  ");

            await waitFor(() =>
                expect(mockGetEmployees).toHaveBeenLastCalledWith(mockAuthenticationService, "alice")
            );
        });
    });

    describe("employee overview details", () => {
        it("renders decimal hours, upcoming leave details and formatted date range", async () => {
            mockGetEmployees.mockResolvedValueOnce([
                { accountId: 1, fullName: "John Doe", position: "Admin" },
            ]);

            mockGetEmployeeOverview.mockResolvedValueOnce(
                makeOverview({
                    hoursWorkedThisMonth: 40.5,
                    latesThisMonth: 7,
                    upcomingLeave: {
                        leaveType: "Annual Leave",
                        startDate: "2026-08-03",
                        endDate: "2026-08-08",
                    },
                })
            );

            renderEmployeeOverview();

            expect(await screen.findByText("40.5 hours")).toBeInTheDocument();
            expect(await screen.findByText("7")).toBeInTheDocument();
            expect(await screen.findByText("Annual Leave")).toBeInTheDocument();
            expect(await screen.findByText("03 August - 08 August 2026")).toBeInTheDocument();
        });

        it("returns to the empty state when loading the selected employee overview fails", async () => {
            // Given the employee list loads but the selected employee overview fails to load
            mockGetEmployees.mockResolvedValueOnce([{ accountId: 1, fullName: "John Doe", position: "Admin" }]);
            mockGetEmployeeOverview.mockRejectedValueOnce(new Error("unknow error"));

            // When the page is rendered
            renderEmployeeOverview();

            // Then the details panel should fall back to the empty state
            expect(await screen.findAllByText(/select an employee/i)).not.toHaveLength(0);
            expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
        });
    });

    describe("payslip month select", () => {
        it("initialises the payslip month to the current month and allows it to be changed", async () => {
            // Given a selected employee is loaded so the payslip section is visible
            mockGetEmployees.mockResolvedValueOnce([{ accountId: 1, fullName: "John Doe", position: "Admin" }]);
            mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

            renderEmployeeOverview();

            await screen.findByText("Payslip Management");

            const select = screen.getByRole("combobox");

            // Then the first option should be the current month
            expect(select).toHaveTextContent(currentMonthLabel());

            // When the payslip month dropdown is opened
            fireEvent.mouseDown(select);

            // Then twelve month options should be rendered
            expect(await screen.findByRole("option", { name: currentMonthLabel() })).toBeInTheDocument();
            expect(screen.getByRole("option", { name: previousMonthLabel(1) })).toBeInTheDocument();
            expect(screen.getByRole("option", { name: previousMonthLabel(11) })).toBeInTheDocument();

            // When a different month is selected
            await userEvent.click(screen.getByRole("option", { name: previousMonthLabel(1) }));

            // Then the selected value should update
            expect(screen.getByRole("combobox")).toHaveTextContent(previousMonthLabel(1));
        });
    });

    describe("unmount safety", () => {
        it("does not update state when the employee list request resolves after unmount", async () => {
            // Given the employee list request resolves after the component has unmounted
            const pendingEmployees = deferred<{ accountId: number; fullName: string; position: string }[]>();
            mockGetEmployees.mockReturnValueOnce(pendingEmployees.promise);

            const { unmount } = renderEmployeeOverview();

            // When the component unmounts before the request resolves
            unmount();

            await act(async () => {
                pendingEmployees.resolve([{ accountId: 1, fullName: "John Doe", position: "Admin" }]);
                await pendingEmployees.promise;
            });

            // Then no follow-up overview request should occur
            expect(mockGetEmployeeOverview).not.toHaveBeenCalled();
        });

        it("does not update state when the employee list request rejects after unmount", async () => {
            // Given the employee list request rejects after the component has been unmounted
            const pendingEmployees = deferred<never>();
            mockGetEmployees.mockReturnValueOnce(pendingEmployees.promise);

            const { unmount } = renderEmployeeOverview();

            // When the component unmounts before the request rejects
            unmount();

            await act(async () => {
                pendingEmployees.reject(new Error("unknow error"));
                try {
                    await pendingEmployees.promise;
                } catch {
                    return;
                }
            });

            // Then no follow-up overview request should occur
            expect(mockGetEmployeeOverview).not.toHaveBeenCalled();
        });

        it("does not update state when the employee overview request resolves after unmount", async () => {
            // Given the list loads immediately but the employee overview resolves after unmount
            const pendingOverview = deferred<ReturnType<typeof makeOverview>>();
            mockGetEmployees.mockResolvedValueOnce([{ accountId: 1, fullName: "John Doe", position: "Admin" }]);
            mockGetEmployeeOverview.mockReturnValueOnce(pendingOverview.promise);

            const { unmount } = renderEmployeeOverview();

            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 1)
            );

            // When the component unmounts before the overview request resolves
            unmount();

            await act(async () => {
                pendingOverview.resolve(makeOverview());
                await pendingOverview.promise;
            });

            // Then the test completes without any post-unmount state update problems
            expect(mockGetEmployeeOverview).toHaveBeenCalledTimes(1);
        });

        it("does not update state when the employee overview request rejects after unmount", async () => {
            // Given the list loads immediately but the employee overview rejects after unmount
            const pendingOverview = deferred<never>();
            mockGetEmployees.mockResolvedValueOnce([{ accountId: 1, fullName: "John Doe", position: "Admin" }]);
            mockGetEmployeeOverview.mockReturnValueOnce(pendingOverview.promise);

            const { unmount } = renderEmployeeOverview();

            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 1)
            );

            // When the component unmounts before the overview request rejects
            unmount();

            await act(async () => {
                pendingOverview.reject(new Error("unknow error"));
                try {
                    await pendingOverview.promise;
                } catch {
                    // swallow test promise rejection
                }
            });

            // Then the test completes without any post-unmount state update problems
            expect(mockGetEmployeeOverview).toHaveBeenCalledTimes(1);
        });

        it("renders all employees returned in the side list", async () => {
            mockGetEmployees.mockResolvedValueOnce(makeEmployees().slice(0, 3));
            mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

            renderEmployeeOverview();

            expect(await screen.findByText("Employees (3)")).toBeInTheDocument();
            expect(screen.getAllByText("John Doe")[0]).toBeInTheDocument();
            expect(screen.getAllByText("Jane Smith")[0]).toBeInTheDocument();
            expect(screen.getAllByText("Bob Jones")[0]).toBeInTheDocument();
            expect(screen.getAllByText("Admin")[0]).toBeInTheDocument();
            expect(screen.getAllByText("Manager")[0]).toBeInTheDocument();
            expect(screen.getAllByText("Employee")[0]).toBeInTheDocument();
        });

        it("shows whole-number hours without a decimal", async () => {
            mockGetEmployees.mockResolvedValueOnce([
                { accountId: 1, fullName: "John Doe", position: "Admin" },
            ]);
            mockGetEmployeeOverview.mockResolvedValueOnce(
                makeOverview({
                    hoursWorkedThisMonth: 40,
                })
            );

            renderEmployeeOverview();

            expect(await screen.findByText("40 hours")).toBeInTheDocument();
            expect(screen.queryByText("40.0 hours")).not.toBeInTheDocument();
        });

        it("shows the learning section empty message", async () => {
            mockGetEmployees.mockResolvedValueOnce([
                { accountId: 1, fullName: "John Doe", position: "Admin" },
            ]);
            mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

            renderEmployeeOverview();

            expect(await screen.findByText(/college and learning days/i)).toBeInTheDocument();
            expect(screen.getByText(/education type/i)).toBeInTheDocument();
            expect(screen.getByText(/no learning day information available/i)).toBeInTheDocument();
        });
    });

    describe("button handlers", () => {
        it("allows the add employee button to be clicked", async () => {
            // Given the add employee button is visible
            mockGetEmployees.mockResolvedValueOnce([]);
            renderEmployeeOverview();

            await screen.findByText("Employees (0)");
            const addButton = screen.getByRole("button", { name: /add employee/i });

            // When the add employee button is clicked
            expect(() => {
                fireEvent.click(addButton);
            }).not.toThrow();

            // TODO: When this feature is implemented, replace this with the correct handling assertions
            // Then the button should not do anything
            expect(mockGetEmployeeOverview).not.toHaveBeenCalled();
        });

        it("allows the edit employee button to be clicked", async () => {
            // Given the edit employee button is visible for a selected employee
            mockGetEmployees.mockResolvedValueOnce([
                { accountId: 1, fullName: "John Doe", position: "Admin" },
            ]);
            mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());
            renderEmployeeOverview();

            await screen.findByRole("button", { name: /edit employee/i });
            const editButton = screen.getByRole("button", { name: /edit employee/i });

            // When the edit employee button is clicked
            expect(() => {
                fireEvent.click(editButton);
            }).not.toThrow();

            // TODO: When this feature is implemented, replace this with the correct handling assertions
            // Then the button should not do anything
            expect(mockGetEmployeeOverview).toHaveBeenCalledTimes(1);
        });

        it("allows the upload button to be clicked", async () => {
            // Given the upload button is visible for a selected employee
            mockGetEmployees.mockResolvedValueOnce([
                { accountId: 1, fullName: "John Doe", position: "Admin" },
            ]);
            mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());
            renderEmployeeOverview();

            await screen.findByRole("button", { name: /upload/i });
            const uploadButton = screen.getByRole("button", { name: /upload/i });

            // When the upload button is clicked
            expect(() => {
                fireEvent.click(uploadButton);
            }).not.toThrow();

            // TODO: When this feature is implemented, replace this with the correct handling assertions
            // Then the button should not do anything
            expect(mockGetEmployeeOverview).toHaveBeenCalledTimes(1);
        });
    });

    describe("employee overview unmount", () => {
        it("covers the early return inside overview success handler after unmount", async () => {
            // Given the employee overview request is awaiting when the component unmounts
            const pendingOverview = deferred<ReturnType<typeof makeOverview>>();
            mockGetEmployees.mockResolvedValueOnce([
                { accountId: 1, fullName: "John Doe", position: "Admin" },
            ]);
            mockGetEmployeeOverview.mockReturnValueOnce(pendingOverview.promise);
            const { unmount } = renderEmployeeOverview();
            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 1)
            );

            // When the component unmounts before the overview request resolves
            unmount();
            await act(async () => {
                pendingOverview.resolve(
                    makeOverview({
                        email: "resolved-after-unmount@example.com",
                    })
                );
                await pendingOverview.promise;
            });

            // Then the component should not update the state
            expect(screen.queryByText("resolved-after-unmount@example.com")).not.toBeInTheDocument();
        });

        it("error handling for after unmount", async () => {
            // Given the employee overview request is awaiting when the component unmounts
            const pendingOverview = deferred<never>();
            mockGetEmployees.mockResolvedValueOnce([
                { accountId: 1, fullName: "John Doe", position: "Admin" },
            ]);
            mockGetEmployeeOverview.mockReturnValueOnce(pendingOverview.promise);
            const { unmount } = renderEmployeeOverview();
            await waitFor(() =>
                expect(mockGetEmployeeOverview).toHaveBeenCalledWith(mockAuthenticationService, 1)
            );

            // When the component attempts to unmount
            unmount();
            await act(async () => {
                pendingOverview.reject(new Error("unknow error"));
                try {
                    await pendingOverview.promise;
                } catch {
                    return;
                }
            });

            // Then the component should not update the state and the test should complete without error
            expect(mockGetEmployeeOverview).toHaveBeenCalledTimes(1);
        });
    });

    it("toggles the P60 checkbox", async () => {
        mockGetEmployees.mockResolvedValueOnce([
            { accountId: 1, fullName: "John Doe", position: "Admin" },
        ]);
        mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

        renderEmployeeOverview();

        await screen.findByText("Payslip Management");

        const checkbox = screen.getByRole("checkbox");

        expect(checkbox).not.toBeChecked();

        await userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
    });

    it("selects a payslip file and displays filename", async () => {
        mockGetEmployees.mockResolvedValueOnce([
            { accountId: 1, fullName: "John Doe", position: "Admin" },
        ]);
        mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

        renderEmployeeOverview();

        await screen.findByText("Payslip Management");

        const file = new File(["dummy"], "payslip.pdf", {
            type: "application/pdf",
        });

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        await userEvent.upload(input, file);

        expect(await screen.findByText(/Selected: payslip\.pdf/i)).toBeInTheDocument();
    });

    it("shows error when uploading without file", async () => {
        mockGetEmployees.mockResolvedValueOnce([
            { accountId: 1, fullName: "John Doe", position: "Admin" },
        ]);
        mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

        renderEmployeeOverview();

        await screen.findByRole("button", { name: /upload/i });

        await userEvent.click(screen.getByRole("button", { name: /upload/i }));

        expect(await screen.findByText(/please select a pdf file/i)).toBeInTheDocument();
    });

    it("successfully uploads a payslip", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
        });

        mockGetEmployees.mockResolvedValueOnce([
            { accountId: 1, fullName: "John Doe", position: "Admin" },
        ]);

        mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

        renderEmployeeOverview();

        await screen.findByText("Payslip Management");

        const file = new File(["pdf"], "payslip.pdf", {
            type: "application/pdf",
        });

        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;

        await userEvent.upload(input, file);

        // inject file into component state already handled via upload

        // mock authenticationService.fetch
        const auth = mockUseAuth();
        auth.authenticationService.fetch = fetchMock;

        await userEvent.click(screen.getByRole("button", { name: /upload/i }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalled();
            expect(screen.getByText(/uploaded successfully/i)).toBeInTheDocument();
        });
    });

    it("triggers hidden file input click", async () => {
        mockGetEmployees.mockResolvedValueOnce([
            { accountId: 1, fullName: "John Doe", position: "Admin" },
        ]);

        mockGetEmployeeOverview.mockResolvedValueOnce(makeOverview());

        renderEmployeeOverview();

        await screen.findByText("Payslip Management");

        const input = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;

        const clickSpy = jest.spyOn(input, "click");

        await userEvent.click(screen.getByText(/upload file/i));

        expect(clickSpy).toHaveBeenCalled();
    });
});
