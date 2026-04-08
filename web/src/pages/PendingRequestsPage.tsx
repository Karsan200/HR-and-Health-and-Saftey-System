import { useState, useEffect, useCallback } from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
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
import { eventConfig, type CalendarEventType } from "../models/CalendarTypes";
import { pendingRequestsPageStyles as styles } from "./PendingRequestsPage.styles";

// Maps the display label returned by the backend to the CalendarEventType
const leaveTypeToEventType: Record<string, CalendarEventType> = {
    Holiday:  "bookedLeave",
    Sick:     "sickLeave",
    Training: "trainingLeave",
};

function getLeaveTypeColours(leaveType: string): { bg: string; textColor: string } {
    const eventType = leaveTypeToEventType[leaveType] ?? "bookedLeave";
    const { chipBg, textColor } = eventConfig(eventType);
    return { bg: chipBg, textColor };
}

interface LeaveRequestCardProps {
    request: PendingLeaveRequest;
    onApprove: (leaveId: number, reason: string) => Promise<void>;
    onDecline: (leaveId: number, reason: string) => Promise<void>;
}

function LeaveRequestCard({ request, onApprove, onDecline }: LeaveRequestCardProps) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { bg, textColor } = getLeaveTypeColours(request.leaveType);

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
                                ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
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
                                ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
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

    const [requests, setRequests] = useState<PendingLeaveRequest[]>([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

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
        { label: "Clock Overrides",  route: "/calendar/overrides" },
    ];

    return (
        <Box sx={styles.pageContainer}>
            <SectionNavBar tabs={calendarTabs} />

            {loading && (
                <Box sx={styles.loadingContainer}>
                    <CircularProgress size={32} sx={{ color: "#AE010B" }} />
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
                            onApprove={handleApprove}
                            onDecline={handleDecline}
                        />
                    ))
                )
            )}
        </Box>
    );
}