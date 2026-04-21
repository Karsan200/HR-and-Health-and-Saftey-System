import { useState, useEffect, useCallback } from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { useAuth } from "../AuthContext";
import {
    fetchPendingLeave,
    approveLeaveRequest,
    declineLeaveRequest,
    formatDateRange,
    formatRequestedOn,
    type PendingLeaveRequest,
} from "../logic/PendingRequestsService";
import {
    fetchLeaveTypes,
    findLeaveTypeByName,
    toHex,
    type ResolvedLeaveType,
} from "../logic/LeaveTypeService";
import { pendingRequestsPageStyles as styles } from "./PendingRequestsPage.styles";
import { DefaultColours } from "../theme/colours";
import { fetchReportedClockInCount } from "../logic/ClockOverridesService";

interface LeaveRequestCardProps {
    request: PendingLeaveRequest;
    leaveTypes: ResolvedLeaveType[];
    onApprove: (leaveId: number, reason: string) => Promise<void>;
    onDecline: (leaveId: number, reason: string) => Promise<void>;
}

function LeaveRequestCard({ request, leaveTypes, onApprove, onDecline }: LeaveRequestCardProps) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const leaveType = findLeaveTypeByName(leaveTypes, request.leaveType);
    const bg        = leaveType ? toHex(leaveType.colourBg)   : DefaultColours.greenBackgroundLight;
    const textColor = leaveType ? toHex(leaveType.colourIcon) : DefaultColours.greyPrimaryMainText;
    const Icon      = leaveType?.Icon;

    const hasNotes = request.notes !== null && request.notes.trim().length > 0;

    async function handleAction(action: "approve" | "decline") {
        setSubmitting(true);
        setError(null);
        try {
            if (action === "approve") {
                await onApprove(request.leaveId, reason);
            } else {
                await onDecline(request.leaveId, reason);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Box sx={styles.requestCard}>
            <Box sx={styles.requestCardInner}>

                <Box sx={styles.contextBlock}>
                    <Typography sx={styles.employeeName}>
                        {request.employeeName}
                    </Typography>

                    <Box sx={styles.tagRow}>
                        <Box sx={styles.leaveTypeTag(bg)}>
                            {Icon && (
                                <Icon sx={{ fontSize: "18px", color: textColor, mr: "6px" }} />
                            )}
                            <Typography sx={styles.leaveTypeTagText(textColor)}>
                                {request.leaveType}
                            </Typography>
                        </Box>
                        <Typography sx={styles.requestedOnText}>
                            {formatRequestedOn(request.created)}
                        </Typography>
                    </Box>

                    <Typography sx={styles.dateRange}>
                        {formatDateRange(request.startDate, request.endDate)}
                    </Typography>
                </Box>

                {/* Employee notes box */}
                <Box sx={styles.notesBox}>
                    <Box sx={styles.notesHeader}>
                        <NotesOutlinedIcon sx={styles.notesIcon} />
                        <Typography sx={styles.notesLabel}>Employee Notes</Typography>
                    </Box>
                    <Typography sx={styles.notesText(hasNotes)}>
                        {hasNotes ? request.notes : "No notes left for this leave request"}
                    </Typography>
                </Box>

                <Box sx={styles.reasonSection}>
                    <Typography sx={styles.reasonLabel}>
                        Reason (Optional)
                    </Typography>
                    <TextField
                        multiline
                        rows={3}
                        placeholder="Add a note or reason..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={submitting}
                        fullWidth
                        sx={styles.reasonTextField}
                    />
                    {error && (
                        <Typography sx={styles.errorText}>
                            {error}
                        </Typography>
                    )}
                </Box>

                <Box sx={styles.buttonRow}>
                    <Button
                        variant="contained"
                        startIcon={
                            submitting
                                ? <CircularProgress size={20} sx={{ color: DefaultColours.white }} />
                                : <CheckIcon sx={styles.buttonIcon} />
                        }
                        onClick={() => handleAction("approve")}
                        disabled={submitting}
                        sx={styles.approveButton}
                    >
                        <Typography sx={styles.buttonLabel}>Approve</Typography>
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            submitting
                                ? <CircularProgress size={20} sx={{ color: DefaultColours.white }} />
                                : <CloseIcon sx={styles.buttonIcon} />
                        }
                        onClick={() => handleAction("decline")}
                        disabled={submitting}
                        sx={styles.declineButton}
                    >
                        <Typography sx={styles.buttonLabel}>Decline</Typography>
                    </Button>
                </Box>

            </Box>
        </Box>
    );
}

export function PendingRequestsPage() {
    const { authenticationService } = useAuth();

    const [requests, setRequests]     = useState<PendingLeaveRequest[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<ResolvedLeaveType[]>([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [reportedCount, setReportedCount] = useState<number>(0);

    // Fetch leave types once on mount for colours and icons
    const loadLeaveTypes = useCallback(async () => {
        try {
            const data = await fetchLeaveTypes(authenticationService);
            setLeaveTypes(data);
        } catch {
            // Non-critical — tags fall back to grey if this fails
        }
    }, [authenticationService]);

    useEffect(() => {
        loadLeaveTypes();
    }, [loadLeaveTypes]);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchPendingLeave(authenticationService);
            setRequests(data);
        } catch {
            setError("Failed to load pending requests. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [authenticationService]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    // Fetch the reported clock-in count once on mount for the nav badge
    const loadReportedCount = useCallback(async () => {
        try {
            const count = await fetchReportedClockInCount(authenticationService);
            setReportedCount(count);
        } catch {
            // Non-critical — badge stays at 0 if the request fails
        }
    }, [authenticationService]);

    useEffect(() => {
        loadReportedCount();
    }, [loadReportedCount]);

    async function handleApprove(leaveId: number, reason: string) {
        await approveLeaveRequest(leaveId, reason, authenticationService);
        setRequests((prev) => prev.filter((r) => r.leaveId !== leaveId));
    }

    async function handleDecline(leaveId: number, reason: string) {
        await declineLeaveRequest(leaveId, reason, authenticationService);
        setRequests((prev) => prev.filter((r) => r.leaveId !== leaveId));
    }

    const calendarTabs: SectionNavTab[] = [
        { label: "Calendar View",    route: "/calendar" },
        { label: "Pending Requests", route: "/calendar/requests", alert: true, count: requests.length },
        { label: "Clock Overrides",  route: "/calendar/overrides", count: reportedCount },
    ];

    return (
        <Box sx={styles.pageContainer}>
            <SectionNavBar tabs={calendarTabs} />

            {loading && (
                <Box sx={styles.loadingContainer}>
                    <CircularProgress size={32} sx={{ color: DefaultColours.redPrimary }} />
                </Box>
            )}

            {!loading && error && (
                <Box sx={styles.emptyState}>
                    <Typography sx={styles.errorText}>{error}</Typography>
                </Box>
            )}

            {!loading && !error && (
                requests.length === 0 ? (
                    <Box sx={styles.emptyState}>
                        <Typography sx={styles.emptyStateText}>
                            No pending requests
                        </Typography>
                    </Box>
                ) : (
                    requests.map((request) => (
                        <LeaveRequestCard
                            key={request.leaveId}
                            request={request}
                            leaveTypes={leaveTypes}
                            onApprove={handleApprove}
                            onDecline={handleDecline}
                        />
                    ))
                )
            )}
        </Box>
    );
}