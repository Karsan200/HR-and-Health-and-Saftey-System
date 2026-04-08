import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from "@mui/material";
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
    getEmployees,
    getEmployeeOverview,
    sanitiseEmployeeSearch,
    type EmployeeListItemResponse,
    type EmployeeOverviewResponse,
} from "../logic/EmployeeOverviewService";
import { employeeOverviewStyles as styles } from "./EmployeeOverview.style";

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

export function EmployeeOverview() {
    const { authenticationService } = useAuth();

    const [employees, setEmployees] = useState<EmployeeListItemResponse[]>([]);
    const [search, setSearch] = useState("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOverviewResponse | null>(null);
    const [selectedPayslipMonth, setSelectedPayslipMonth] = useState("");
    const [listError, setListError] = useState<string | null>(null);

    const sanitisedSearch = useMemo(() => sanitiseEmployeeSearch(search), [search]);

    useEffect(() => {
        let isMounted = true;

        getEmployees(authenticationService, sanitisedSearch)
            .then((response) => {
                if (!isMounted) {
                    return;
                }

                const safeEmployees = response ?? [];

                setEmployees(safeEmployees);
                setListError(null);

                if (safeEmployees.length === 0) {
                    setSelectedEmployeeId(null);
                    setSelectedEmployee(null);
                    return;
                }

                setSelectedEmployeeId((currentSelectedEmployeeId) => {
                    const selectedStillExists = safeEmployees.some(
                        (employee) => employee.accountId === currentSelectedEmployeeId
                    );

                    return selectedStillExists
                        ? currentSelectedEmployeeId
                        : safeEmployees[0].accountId;
                });
            })
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
    }, [authenticationService, sanitisedSearch]);

    useEffect(() => {
        if (selectedEmployeeId === null) {
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
    }, [authenticationService, selectedEmployeeId]);

    return (
        <Box sx={styles.pageContainer}>
            <Box sx={styles.content}>
                <Box sx={styles.layout}>
                    <Paper elevation={0} sx={styles.sideCard}>
                        <Box sx={styles.sideHeader}>
                            <Typography variant="h6">
                                Employees ({employees.length})
                            </Typography>

                            <IconButton onClick={() => void 0}>
                                <AddRoundedIcon />
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
                                            <SearchRoundedIcon />
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

                        <Box sx={styles.employeeListContainer}>
                            {employees.length === 0 ? (
                                <Typography sx={styles.emptyListText}>
                                    No employees found.
                                </Typography>
                            ) : (
                                <Box sx={styles.employeeList}>
                                    {employees.map((employee) => {
                                        const isSelected = employee.accountId === selectedEmployeeId;

                                        return (
                                            <Box
                                                key={employee.accountId}
                                                onClick={() => setSelectedEmployeeId(employee.accountId)}
                                                sx={[
                                                    styles.employeeListItem,
                                                    isSelected && styles.employeeListItemSelected,
                                                ]}
                                            >
                                                <Box sx={styles.employeeListItemIconWrapper}>
                                                    <PersonOutlineRoundedIcon />
                                                </Box>

                                                <Box sx={styles.employeeListItemText}>
                                                    <Typography>{employee.fullName}</Typography>
                                                    <Typography variant="body2">
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

                    {selectedEmployeeId === null || selectedEmployee === null ? (
                        <Box sx={styles.emptyState}>
                            <Box>
                                <PersonOutlineRoundedIcon fontSize="large" />
                                <Typography variant="h6">
                                    Select an Employee
                                </Typography>
                                <Typography variant="body2">
                                    Choose an employee from the list to view their details
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Paper elevation={0} sx={styles.detailsCard}>
                            <Box sx={styles.employeeHeader}>
                                <Box>
                                    <Typography variant="h5">
                                        {selectedEmployee.fullName}
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedEmployee.position}
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedEmployee.email}
                                    </Typography>
                                </Box>

                                <IconButton>
                                    <EditOutlinedIcon />
                                </IconButton>
                            </Box>

                            <Box sx={styles.statsRow}>
                                <Paper elevation={0} sx={styles.statCard}>
                                    <Box sx={styles.sectionHeader}>
                                        <AccessTimeRoundedIcon />
                                        <Typography variant="subtitle1">
                                            Hours Worked
                                        </Typography>
                                    </Box>
                                    <Typography>
                                        {selectedEmployee.hoursWorkedThisMonth} hours this month
                                    </Typography>
                                </Paper>

                                <Paper elevation={0} sx={styles.statCard}>
                                    <Box sx={styles.sectionHeader}>
                                        <WarningAmberRoundedIcon />
                                        <Typography variant="subtitle1">
                                            Lates
                                        </Typography>
                                    </Box>
                                    <Typography>
                                        {selectedEmployee.latesThisMonth} this month
                                    </Typography>
                                </Paper>
                            </Box>

                            <Paper elevation={0} sx={styles.sectionCard}>
                                <Box sx={styles.sectionHeader}>
                                    <EventAvailableRoundedIcon />
                                    <Typography variant="subtitle1">
                                        Upcoming Time Off
                                    </Typography>
                                </Box>

                                {selectedEmployee.upcomingLeave === null ? (
                                    <Typography>No upcoming approved leave</Typography>
                                ) : (
                                    <Box>
                                        <Typography>
                                            {selectedEmployee.upcomingLeave.leaveType}
                                        </Typography>
                                        <Typography>
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
                                    <SchoolOutlinedIcon />
                                    <Typography variant="subtitle1">
                                        College and Learning Days
                                    </Typography>
                                </Box>

                                <Typography>Not yet implemented</Typography>
                            </Paper>

                            <Paper elevation={0} sx={styles.sectionCard}>
                                <Box sx={styles.sectionHeader}>
                                    <DescriptionOutlinedIcon />
                                    <Typography variant="subtitle1">
                                        Payslip Management
                                    </Typography>
                                </Box>

                                <Box sx={styles.payslipRow}>
                                    <Select
                                        fullWidth
                                        value={selectedPayslipMonth}
                                        onChange={(event) => setSelectedPayslipMonth(event.target.value)}
                                    >
                                        <MenuItem value="January 2026">January 2026</MenuItem>
                                        <MenuItem value="February 2026">February 2026</MenuItem>
                                        <MenuItem value="March 2026">March 2026</MenuItem>
                                    </Select>

                                    <Button
                                        variant="contained"
                                        startIcon={<UploadRoundedIcon />}
                                        onClick={() => void 0}
                                    >
                                        Upload
                                    </Button>
                                </Box>
                            </Paper>
                        </Paper>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
