import { AuthenticationService } from "./AuthenticationService";

export type EmployeeListItemResponse = {
    accountId: number;
    fullName: string;
    position: string;
};

export type EmployeeUpcomingLeaveResponse = {
    leaveType: string;
    startDate: string;
    endDate: string;
};

export type EmployeeOverviewResponse = {
    accountId: number;
    fullName: string;
    position: string;
    email: string;
    hoursWorkedThisMonth: number;
    latesThisMonth: number;
    upcomingLeave: EmployeeUpcomingLeaveResponse | null;
};

const MAX_SEARCH_LENGTH = 100;

export function sanitiseEmployeeSearch(search: string): string {
    return search.replace(/\s+/g, " ").trim().slice(0, MAX_SEARCH_LENGTH);
}

export async function getEmployees(
    authenticationService: AuthenticationService,
    search: string = ""
): Promise<EmployeeListItemResponse[]> {
    const sanitisedSearch = sanitiseEmployeeSearch(search);

    const url = sanitisedSearch === ""
        ? "/api/admin/employees"
        : `/api/admin/employees?search=${encodeURIComponent(sanitisedSearch)}`;

    const response = await authenticationService.fetch(url, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch employees");
    }

    return response.json();
}

export async function getEmployeeOverview(
    authenticationService: AuthenticationService,
    accountId: number
): Promise<EmployeeOverviewResponse> {
    if (!Number.isInteger(accountId) || accountId <= 0) {
        throw new Error("Invalid employee id");
    }

    const response = await authenticationService.fetch(`/api/admin/employees/${accountId}`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch employee overview");
    }

    return response.json();
}
