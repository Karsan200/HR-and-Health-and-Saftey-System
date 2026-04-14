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
const MAX_NAME_LENGTH = 50;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 17;
const MAX_ADDRESS_LINE_LENGTH = 120;
const MAX_POSTCODE_LENGTH = 8;
const MAX_USERNAME_LENGTH = 32;
const MIN_PASSWORD_LENGTH = 8;

export type CreateEmployeeRequest = {
    firstName: string;
    surname: string;
    email: string;
    phoneNumber: string;
    addressOne: string;
    addressTwo: string;
    postalCode: string;
    position: string;
    username: string;
    password: string;
};

export function sanitiseName(value: string): string {
    return value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export function sanitiseEmail(value: string): string {
    return value.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH);
}

export function sanitisePhoneNumber(value: string): string {
    return value
        .replace(/[^\d+()\-\s]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/[()\-\s]/g, "")
        .slice(0, MAX_PHONE_LENGTH);
}

export function sanitiseAddress(value: string): string {
    return value.replace(/\s+/g, " ").trim().slice(0, MAX_ADDRESS_LINE_LENGTH);
}

export function sanitisePostalCode(value: string): string {
    return value.replace(/\s+/g, " ").trim().toUpperCase().slice(0, MAX_POSTCODE_LENGTH);
}

export function sanitiseUsername(value: string): string {
    return value.trim().slice(0, MAX_USERNAME_LENGTH);
}

export function sanitisePassword(value: string): string {
    return value.trimStart();
}

export function normalisePosition(value: string): string {
    const trimmed = value.trim().toLowerCase();

    switch (trimmed) {
        case "employee":
            return "Employee";
        case "manager":
            return "Manager";
        case "admin":
            return "Admin";
        default:
            return value.trim();
    }
}

export function validateCreateEmployeeRequest(request: CreateEmployeeRequest): string | null {
    if (request.firstName === "") return "First name is required.";
    if (request.surname === "") return "Surname is required.";
    if (request.email === "") return "Email is required.";
    if (request.phoneNumber === "") return "Phone number is required.";
    if (request.addressOne === "") return "Address line one is required.";
    if (request.postalCode === "") return "Postal code is required.";
    if (request.position === "") return "Position is required.";
    if (request.username === "") return "Username is required.";
    if (request.password === "") return "Password is required.";

    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailPattern.test(request.email)) {
        return "Please enter a valid email address.";
    }

    const usernamePattern = /^[A-Za-z0-9._-]+$/;
    if (!usernamePattern.test(request.username)) {
        return "Username may only contain letters, numbers, dots, underscores, and hyphens.";
    }

    if (request.password.length < MIN_PASSWORD_LENGTH) {
        return "Password must be at least 8 characters.";
    }

    if (!["Employee", "Manager", "Admin"].includes(request.position)) {
        return "Position must be Employee, Manager, or Admin.";
    }

    return null;
}

export function buildCreateEmployeeRequest(raw: CreateEmployeeRequest): CreateEmployeeRequest {
    return {
        firstName: sanitiseName(raw.firstName),
        surname: sanitiseName(raw.surname),
        email: sanitiseEmail(raw.email),
        phoneNumber: sanitisePhoneNumber(raw.phoneNumber),
        addressOne: sanitiseAddress(raw.addressOne),
        addressTwo: sanitiseAddress(raw.addressTwo),
        postalCode: sanitisePostalCode(raw.postalCode),
        position: normalisePosition(raw.position),
        username: sanitiseUsername(raw.username),
        password: sanitisePassword(raw.password),
    };
}

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

export async function createEmployee(
    authenticationService: AuthenticationService,
    rawRequest: CreateEmployeeRequest
): Promise<EmployeeListItemResponse> {
    const request = buildCreateEmployeeRequest(rawRequest);
    const validationError = validateCreateEmployeeRequest(request);

    if (validationError !== null) {
        throw new Error(validationError);
    }

    const response = await authenticationService.fetch("/api/admin/employees", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to create employee");
    }

    return response.json();
}
