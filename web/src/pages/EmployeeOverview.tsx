import {useCallback , useEffect, useMemo, useRef, useState} from "react";
import {
    Box,
    Button, Checkbox, FormControlLabel,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";

import { useAuth } from "../AuthContext";
import {
    buildCreateEmployeeRequest,
    createEmployee,
    getEmployees,
    getEmployeeOverview,
    sanitiseEmployeeSearch,
    type CreateEmployeeRequest,
    type EmployeeListItemResponse,
    type EmployeeOverviewResponse,
} from "../logic/EmployeeOverviewService";
import { employeeOverviewStyles as styles } from "./EmployeeOverview.style";

const POSITION_OPTIONS = ["Employee", "Manager", "Admin"] as const;

const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startText = start.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
    });

    const endText = end.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    return `${startText} - ${endText}`;
};

const formatHoursWorked = (hoursWorked: number): string => {
    return Number.isInteger(hoursWorked) ? `${hoursWorked}` : hoursWorked.toFixed(1);
};

const buildPayslipMonthOptions = (numberOfMonths: number): string[] => {
    const options: string[] = [];
    const baseDate = new Date();

    for (let monthOffset = 0; monthOffset < numberOfMonths; monthOffset += 1) {
        const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - monthOffset, 1);

        options.push(
            monthDate.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
            })
        );
    }

    return options;
};

const buildInitialCreateForm = (): CreateEmployeeRequest => ({
    firstName: "",
    surname: "",
    email: "",
    phoneNumber: "",
    addressOne: "",
    addressTwo: "",
    postalCode: "",
    position: "Employee",
    username: "",
    password: "",
});

export function EmployeeOverview() {
    const { authenticationService } = useAuth();

    const [employees, setEmployees] = useState<EmployeeListItemResponse[]>([]);
    const [search, setSearch] = useState("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOverviewResponse | null>(null);
    const [listError, setListError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [payslipFile, setPayslipFile] = useState<File | null>(null);
    const [payslipError, setPayslipError] = useState<string | null>(null);
    const [isP60, setIsP60] = useState(false);
    const [payslipSuccess, setPayslipSuccess] = useState<string | null>(null);

    const [isAddingEmployee, setIsAddingEmployee] = useState(false);
    const [createForm, setCreateForm] = useState<CreateEmployeeRequest>(buildInitialCreateForm);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState<string | null>(null);
    const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);

    const sanitisedSearch = useMemo(() => sanitiseEmployeeSearch(search), [search]);

    const payslipMonthOptions = useMemo(() => buildPayslipMonthOptions(12), []);
    const [selectedPayslipMonth, setSelectedPayslipMonth] = useState<string>(
        () => payslipMonthOptions[0] ?? ""
    );

    const isFormValid = useMemo(() => {
        return (
            createForm.firstName.trim() !== "" &&
            createForm.surname.trim() !== "" &&
            createForm.email.trim() !== "" &&
            createForm.phoneNumber.trim() !== "" &&
            createForm.addressOne.trim() !== "" &&
            createForm.postalCode.trim() !== "" &&
            createForm.position.trim() !== "" &&
            createForm.username.trim() !== "" &&
            createForm.password.trim() !== ""
        );
    }, [createForm]);

    const loadEmployees = useCallback(async (preferredEmployeeId?: number) => {
        const response = await getEmployees(authenticationService, sanitisedSearch);
        const safeEmployees = response ?? [];

        setEmployees(safeEmployees);
        setListError(null);

        if (safeEmployees.length === 0) {
            setSelectedEmployeeId(null);
            setSelectedEmployee(null);
            return;
        }

        setSelectedEmployeeId((currentSelectedEmployeeId) => {
            if (
                preferredEmployeeId !== undefined &&
                safeEmployees.some((employee) => employee.accountId === preferredEmployeeId)
            ) {
                return preferredEmployeeId;
            }

            const selectedStillExists = safeEmployees.some(
                (employee) => employee.accountId === currentSelectedEmployeeId
            );

            return selectedStillExists
                ? currentSelectedEmployeeId
                : safeEmployees[0].accountId;
        });
    }, [authenticationService, sanitisedSearch]);

    useEffect(() => {
        let isMounted = true;

        loadEmployees()
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                setEmployees([]);
                setSelectedEmployeeId(null);
                setSelectedEmployee(null);
                setListError("Unable to load employees.");
            });

        return () => {
            isMounted = false;
        };
    }, [loadEmployees]);

    useEffect(() => {
        if (selectedEmployeeId === null || isAddingEmployee) {
            return;
        }

        let isMounted = true;

        getEmployeeOverview(authenticationService, selectedEmployeeId)
            .then((response) => {
                if (!isMounted) {
                    return;
                }

                setSelectedEmployee(response);
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                setSelectedEmployee(null);
            });

        return () => {
            isMounted = false;
        };
    }, [authenticationService, selectedEmployeeId, isAddingEmployee]);

    const handlePayslipMonthChange = (event: SelectChangeEvent) => {
        setSelectedPayslipMonth(event.target.value);
    };

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(",")[1]);
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    };

    const handlePayslipUpload = async () => {
        if (!payslipFile) {
            setPayslipError("Please select a PDF file.");
            return;
        }

        if (!selectedEmployeeId) {
            setPayslipError("No employee selected.");
            return;
        }

        const [monthName, yearStr] = selectedPayslipMonth.split(" ");
        const year = Number(yearStr);

        const monthMap: Record<string, number> = {
            January: 1,
            February: 2,
            March: 3,
            April: 4,
            May: 5,
            June: 6,
            July: 7,
            August: 8,
            September: 9,
            October: 10,
            November: 11,
            December: 12,
        };

        const month = monthMap[monthName];

        try {
            const content = await readFileAsBase64(payslipFile);

            const res = await authenticationService.fetch("/api/payslips/admin/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountId: selectedEmployeeId,
                    month,
                    year,
                    isP60,
                    content,
                    fileName: payslipFile.name,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            setPayslipFile(null);
            setIsP60(false);
            setPayslipError(null);
            setPayslipSuccess("Payslip uploaded successfully.");
        } catch (e) {
            setPayslipSuccess(null);
            setPayslipError(e instanceof Error ? e.message : "Upload failed");
        }
    };

    //payslip upload handling - only accepts pdf files
    const handlePayslipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setPayslipError(null);
        setPayslipSuccess(null);

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            setPayslipError("Only PDF files are accepted.");
            e.target.value = "";
            return;
        }

        setPayslipFile(file);
        e.target.value = "";
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    const handleOpenAddEmployee = () => {
        setIsAddingEmployee(true);
        setCreateError(null);
        setCreateSuccess(null);
        setCreateForm(buildInitialCreateForm());
    };

    const handleCancelAddEmployee = () => {
        setIsAddingEmployee(false);
        setCreateError(null);
        setCreateSuccess(null);
        setCreateForm(buildInitialCreateForm());
    };

    const handleFormChange = <K extends keyof CreateEmployeeRequest>(
        field: K,
        value: CreateEmployeeRequest[K]
    ) => {
        setCreateSuccess(null);
        setCreateError(null);

        setCreateForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmitCreateEmployee = async () => {
        setCreateError(null);
        setCreateSuccess(null);
        setIsCreatingEmployee(true);

        try {
            const createdEmployee = await createEmployee(
                authenticationService,
                buildCreateEmployeeRequest(createForm)
            );

            await loadEmployees(createdEmployee.accountId);

            setSelectedEmployeeId(createdEmployee.accountId);
            setIsAddingEmployee(false);
            setCreateForm(buildInitialCreateForm());
            setCreateSuccess(`${createdEmployee.fullName} created successfully.`);
        } catch (error) {
            let message = "Failed to create employee.";

            if (error instanceof Error) {
                message = error.message.trim();
                if (message === "") {
                    message = "Something went wrong while creating the employee.";
                }
            }

            setCreateError(message);
        } finally {
            setIsCreatingEmployee(false);
        }
    };

    const fieldHasError = (field: string): boolean => {
        if (!createError) return false;

        const msg = createError.toLowerCase();

        return (
            (field === "email" && msg.includes("email")) ||
            (field === "username" && msg.includes("username")) ||
            (field === "password" && msg.includes("password")) ||
            (field === "phone" && msg.includes("phone")) ||
            (field === "postalCode" && (msg.includes("postal") || msg.includes("postcode"))) ||
            (field === "firstName" && msg.includes("first")) ||
            (field === "surname" && msg.includes("surname")) ||
            (field === "addressOne" && msg.includes("address")) ||
            (field === "position" && msg.includes("position"))
        );
    };

    const showCreateError = createError !== null && createError.trim() !== "";

    return (
        <Box sx={styles.pageContainer}>
            <Box sx={styles.content}>
                <Box sx={styles.layout}>
                    <Paper elevation={0} sx={styles.sideCard}>
                        <Box sx={styles.sideHeader}>
                            <Typography sx={styles.sideTitle}>
                                Employees ({employees.length})
                            </Typography>

                            <IconButton
                                aria-label="Add employee"
                                onClick={handleOpenAddEmployee}
                                sx={styles.addEmployeeButton}
                            >
                                <AddRoundedIcon sx={styles.addEmployeeButtonIcon} />
                            </IconButton>
                        </Box>

                        <TextField
                            fullWidth
                            placeholder="Search employees..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            sx={styles.searchField}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon sx={styles.searchIcon} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        {listError !== null && (
                            <Typography sx={styles.errorText}>
                                {listError}
                            </Typography>
                        )}

                        {createSuccess !== null && (
                            <Typography sx={styles.addEmployeeSuccessText}>
                                {createSuccess}
                            </Typography>
                        )}

                        <Box sx={styles.employeeListContainer}>
                            {employees.length === 0 ? (
                                <Typography sx={styles.emptyListText}>
                                    No employees found.
                                </Typography>
                            ) : (
                                <Box sx={styles.employeeList}>
                                    {employees.map((employee) => {
                                        const isSelected =
                                            !isAddingEmployee && employee.accountId === selectedEmployeeId;

                                        return (
                                            <Box
                                                key={employee.accountId}
                                                onClick={() => {
                                                    setIsAddingEmployee(false);
                                                    setSelectedEmployeeId(employee.accountId);
                                                }}
                                                sx={[
                                                    styles.employeeListItem,
                                                    isSelected && styles.employeeListItemSelected,
                                                ]}
                                            >
                                                <Box
                                                    sx={[
                                                        styles.employeeListItemIconWrapper,
                                                        isSelected && styles.employeeListItemIconWrapperSelected,
                                                    ]}
                                                >
                                                    <PersonOutlineRoundedIcon
                                                        sx={[
                                                            styles.employeeListItemIcon,
                                                            isSelected && styles.employeeListItemIconSelected,
                                                        ]}
                                                    />
                                                </Box>

                                                <Box sx={styles.employeeListItemText}>
                                                    <Typography sx={styles.employeeListItemName}>
                                                        {employee.fullName}
                                                    </Typography>
                                                    <Typography sx={styles.employeeListItemPosition}>
                                                        {employee.position}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    {isAddingEmployee ? (
                        <Paper elevation={0} sx={styles.addEmployeeFormCard}>
                            <Box sx={styles.addEmployeeFormScroll}>
                                <Box sx={styles.addEmployeeSection}>
                                    <Typography sx={styles.addEmployeeSectionTitle}>
                                        Personal
                                    </Typography>

                                    <Box sx={styles.addEmployeeFieldGridTwo}>
                                        <TextField
                                            fullWidth
                                            placeholder="Forename"
                                            value={createForm.firstName}
                                            onChange={(event) =>
                                                handleFormChange("firstName", event.target.value)
                                            }
                                            error={fieldHasError("firstName")}
                                            sx={styles.addEmployeeTextField}
                                        />

                                        <TextField
                                            fullWidth
                                            placeholder="Surname"
                                            value={createForm.surname}
                                            onChange={(event) =>
                                                handleFormChange("surname", event.target.value)
                                            }
                                            error={fieldHasError("surname")}
                                            sx={styles.addEmployeeTextField}
                                        />
                                    </Box>

                                    <Box sx={styles.addEmployeeFieldGridTwo}>
                                        <TextField
                                            fullWidth
                                            placeholder="Email"
                                            value={createForm.email}
                                            onChange={(event) =>
                                                handleFormChange("email", event.target.value)
                                            }
                                            error={fieldHasError("email")}
                                            sx={styles.addEmployeeTextField}
                                        />

                                        <TextField
                                            fullWidth
                                            placeholder="Phone"
                                            value={createForm.phoneNumber}
                                            onChange={(event) =>
                                                handleFormChange("phoneNumber", event.target.value)
                                            }
                                            error={fieldHasError("phone")}
                                            sx={styles.addEmployeeTextField}
                                        />
                                    </Box>

                                    <Box sx={styles.addEmployeeFieldGridOne}>
                                        <TextField
                                            fullWidth
                                            placeholder="Address line one"
                                            value={createForm.addressOne}
                                            onChange={(event) =>
                                                handleFormChange("addressOne", event.target.value)
                                            }
                                            error={fieldHasError("addressOne")}
                                            sx={styles.addEmployeeTextField}
                                        />
                                    </Box>

                                    <Box sx={styles.addEmployeeFieldGridTwo}>
                                        <TextField
                                            fullWidth
                                            placeholder="Address line two (optional)"
                                            value={createForm.addressTwo}
                                            onChange={(event) =>
                                                handleFormChange("addressTwo", event.target.value)
                                            }
                                            sx={styles.addEmployeeTextField}
                                        />

                                        <TextField
                                            fullWidth
                                            placeholder="Postal code"
                                            value={createForm.postalCode}
                                            onChange={(event) =>
                                                handleFormChange("postalCode", event.target.value)
                                            }
                                            error={fieldHasError("postalCode")}
                                            sx={styles.addEmployeeTextField}
                                        />
                                    </Box>

                                    <Box sx={styles.addEmployeeFieldGridOne}>
                                        <Select
                                            fullWidth
                                            displayEmpty
                                            value={createForm.position}
                                            onChange={(event: SelectChangeEvent) =>
                                                handleFormChange("position", event.target.value)
                                            }
                                            error={fieldHasError("position")}
                                            sx={styles.addEmployeeSelect}
                                        >
                                            {POSITION_OPTIONS.map((positionOption) => (
                                                <MenuItem key={positionOption} value={positionOption}>
                                                    {positionOption}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Box>

                                <Box sx={styles.addEmployeeSection}>
                                    <Typography sx={styles.addEmployeeSectionTitle}>
                                        Profile
                                    </Typography>

                                    <Box sx={styles.addEmployeeFieldGridOne}>
                                        <TextField
                                            fullWidth
                                            placeholder="Username"
                                            value={createForm.username}
                                            onChange={(event) =>
                                                handleFormChange("username", event.target.value)
                                            }
                                            error={fieldHasError("username")}
                                            sx={styles.addEmployeeTextField}
                                        />

                                        <TextField
                                            fullWidth
                                            type="password"
                                            placeholder="Password"
                                            value={createForm.password}
                                            onChange={(event) =>
                                                handleFormChange("password", event.target.value)
                                            }
                                            error={fieldHasError("password")}
                                            sx={styles.addEmployeeTextField}
                                        />
                                    </Box>
                                </Box>

                                {showCreateError && (
                                    <Typography
                                        sx={{
                                            ...styles.errorText,
                                            fontWeight: 500,
                                            marginBottom: 2,
                                        }}
                                    >
                                        {createError}
                                    </Typography>
                                )}

                                <Box sx={styles.addEmployeeButtonRow}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancelAddEmployee}
                                        disabled={isCreatingEmployee}
                                        sx={styles.addEmployeeCancelButton}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={handleSubmitCreateEmployee}
                                        disabled={isCreatingEmployee || !isFormValid}
                                        sx={styles.addEmployeeSubmitButton}
                                    >
                                        Create User
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    ) : selectedEmployeeId === null || selectedEmployee === null ? (
                        <Paper elevation={0} sx={styles.emptyStateCard}>
                            <Box sx={styles.emptyStateContent}>
                                <PersonOutlineRoundedIcon sx={styles.emptyStateIcon} />

                                <Typography sx={styles.emptyStateTitle}>
                                    Select an Employee
                                </Typography>

                                <Typography sx={styles.emptyStateSubtitle}>
                                    Choose an employee from the list to view their details
                                </Typography>
                            </Box>
                        </Paper>
                    ) : (
                        <Paper elevation={0} sx={styles.detailsCard}>
                            <Box sx={styles.employeeHeaderCard}>
                                <Box sx={styles.employeeHeaderLeft}>
                                    <Box sx={styles.employeeHeaderIconWrapper}>
                                        <PersonOutlineRoundedIcon sx={styles.employeeHeaderIcon} />
                                    </Box>

                                    <Box sx={styles.employeeHeaderText}>
                                        <Typography sx={styles.employeeHeaderName}>
                                            {selectedEmployee.fullName}
                                        </Typography>
                                        <Typography sx={styles.employeeHeaderPosition}>
                                            {selectedEmployee.position}
                                        </Typography>
                                        <Typography sx={styles.employeeHeaderEmail}>
                                            {selectedEmployee.email}
                                        </Typography>
                                    </Box>
                                </Box>

                                <IconButton
                                    aria-label="Edit employee"
                                    onClick={() => void 0}
                                    sx={styles.employeeHeaderEditButton}
                                >
                                    <EditOutlinedIcon sx={styles.employeeHeaderEditIcon} />
                                </IconButton>
                            </Box>

                            <Box sx={styles.statsRow}>
                                <Paper elevation={0} sx={styles.statCard}>
                                    <Box sx={styles.statCardTopRow}>
                                        <Box sx={styles.hoursWorkedIconWrapper}>
                                            <AccessTimeRoundedIcon sx={styles.hoursWorkedIcon} />
                                        </Box>

                                        <Box sx={styles.statCardTopRowText}>
                                            <Typography sx={styles.statCardPeriodText}>
                                                This Month
                                            </Typography>

                                            <Typography sx={styles.statCardValue}>
                                                {formatHoursWorked(selectedEmployee.hoursWorkedThisMonth)} hours
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography sx={styles.statCardLabel}>
                                        Hours Worked
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={styles.statCard}>
                                    <Box sx={styles.statCardTopRow}>
                                        <Box sx={styles.latesIconWrapper}>
                                            <WarningAmberRoundedIcon sx={styles.latesIcon} />
                                        </Box>

                                        <Box sx={styles.statCardTopRowText}>
                                            <Typography sx={styles.statCardPeriodText}>
                                                This Month
                                            </Typography>

                                            <Typography sx={styles.statCardValue}>
                                                {selectedEmployee.latesThisMonth}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography sx={styles.statCardLabel}>
                                        Late
                                    </Typography>
                                </Paper>
                            </Box>

                            <Paper elevation={0} sx={styles.sectionCard}>
                                <Box sx={styles.sectionHeader}>
                                    <Box sx={styles.timeOffIconWrapper}>
                                        <EventAvailableRoundedIcon sx={styles.timeOffIcon} />
                                    </Box>

                                    <Typography sx={styles.sectionTitle}>
                                        Upcoming Time Off
                                    </Typography>
                                </Box>

                                {selectedEmployee.upcomingLeave === null ? (
                                    <Typography sx={styles.sectionEmptyText}>
                                        No upcoming approved leave
                                    </Typography>
                                ) : (
                                    <Box sx={styles.sectionContent}>
                                        <Typography sx={styles.leaveTypeChip}>
                                            {selectedEmployee.upcomingLeave.leaveType}
                                        </Typography>

                                        <Typography sx={styles.sectionMainText}>
                                            {formatDateRange(
                                                selectedEmployee.upcomingLeave.startDate,
                                                selectedEmployee.upcomingLeave.endDate
                                            )}
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>

                            <Paper elevation={0} sx={styles.sectionCard}>
                                <Box sx={styles.sectionHeader}>
                                    <Box sx={styles.learningIconWrapper}>
                                        <SchoolOutlinedIcon sx={styles.learningIcon} />
                                    </Box>

                                    <Typography sx={styles.sectionTitle}>
                                        College and Learning Days
                                    </Typography>
                                </Box>

                                <Box sx={styles.sectionContent}>
                                    <Typography sx={styles.sectionSecondaryLabel}>
                                        Education Type
                                    </Typography>

                                    <Typography sx={styles.sectionEmptyText}>
                                        No learning day information available
                                    </Typography>
                                </Box>
                            </Paper>

                            <Paper elevation={0} sx={styles.sectionCard}>
                                <Box sx={styles.sectionHeader}>
                                    <Box sx={styles.payslipIconWrapper}>
                                        <DescriptionOutlinedIcon sx={styles.payslipIcon} />
                                    </Box>

                                    <Typography sx={styles.sectionTitle}>
                                        Payslip Management
                                    </Typography>
                                </Box>

                                <Box sx={styles.sectionContent}>
                                    <Typography sx={styles.sectionSecondaryLabel}>
                                        Upload New Payslip
                                    </Typography>

                                    <Box sx={styles.payslipRow}>
                                        <Select
                                            fullWidth
                                            displayEmpty
                                            value={selectedPayslipMonth}
                                            onChange={handlePayslipMonthChange}
                                            sx={styles.payslipSelect}
                                        >
                                            {payslipMonthOptions.map((monthOption) => (
                                                <MenuItem key={monthOption} value={monthOption}>
                                                    {monthOption}
                                                </MenuItem>
                                            ))}
                                        </Select>

                                        <Button
                                            variant="contained"
                                            startIcon={<UploadRoundedIcon />}
                                            onClick={handlePayslipUpload}
                                            sx={styles.uploadButton}
                                        >
                                            Upload
                                        </Button>

                                        <Typography
                                            sx={styles.uploadHintText}
                                            onClick={handleUploadClick}
                                        >
                                            Upload file
                                        </Typography>

                                        {payslipFile && (
                                            <Typography sx={styles.selectedFileText}>
                                                Selected: {payslipFile.name}
                                            </Typography>
                                        )}

                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isP60}
                                                    onChange={(e) => setIsP60(e.target.checked)}
                                                />
                                            }
                                            label="P60"
                                        />

                                        {payslipError && (
                                            <Typography sx={styles.payslipErrorText}>
                                                {payslipError}
                                            </Typography>
                                        )}

                                        {payslipSuccess && (
                                            <Typography sx={styles.payslipSuccessText}>
                                                {payslipSuccess}
                                            </Typography>
                                        )}

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            style={{ display: "none" }}
                                            onChange={handlePayslipFileChange}
                                        />
                                    </Box>
                                </Box>
                            </Paper>
                        </Paper>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
