import { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { pendingRequestsPageStyles as styles } from "./PendingRequestsPage.styles";

const CALENDAR_TABS: SectionNavTab[] = [
    { label: "Calendar View", route: "/calendar" },
    { label: "Pending Requests", route: "/calendar/requests", alert: true },
    { label: "Clock Overrides", route: "/calendar/overrides" },
];

type LeaveType = "Holiday" | "Sick" | "Training" | "Other";

interface LeaveRequest {
    id: number;
    employeeName: string;
    leaveType: LeaveType;
    requestedOn: string;
    dateRange: string;
}

const MOCK_REQUESTS: LeaveRequest[] = [
    {
        id: 1,
        employeeName: "Maggie May",
        leaveType: "Holiday",
        requestedOn: "Requested on 9 February 2026",
        dateRange: "01 March – 03 March 2026",
    },
    {
        id: 2,
        employeeName: "John Doe",
        leaveType: "Holiday",
        requestedOn: "Requested on 28 January 2026",
        dateRange: "14 August – 28 August 2026",
    },
    {
        id: 3,
        employeeName: "Jane Doe",
        leaveType: "Sick",
        requestedOn: "Requested on 9 February 2026",
        dateRange: "10 February 2026",
    },
];

// Maps each leave type to its tag background and text colour
const leaveTypeConfig: Record<LeaveType, { bg: string; textColor: string }> = {
    Holiday:  { bg: "#E6ECF9", textColor: "#002A80" },
    Sick:     { bg: "#D0EDDE", textColor: "#0D7B42" },
    Training: { bg: "#FFECCD", textColor: "#9B6302" },
    Other:    { bg: "#F6F6F8", textColor: "#767676" },
};

interface LeaveRequestCardProps {
    request: LeaveRequest;
    onApprove: (id: number, reason: string) => void;
    onDecline: (id: number, reason: string) => void;
}

function LeaveRequestCard({ request, onApprove, onDecline }: LeaveRequestCardProps) {
    const [reason, setReason] = useState("");
    const { bg, textColor } = leaveTypeConfig[request.leaveType];

    return (
        <Box sx={styles.requestCard}>
            <Box sx={styles.requestCardInner}>

                {/* Employee name, leave type tag, and date range */}
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
                            {request.requestedOn}
                        </Typography>
                    </Box>

                    <Typography sx={styles.dateRange}>
                        {request.dateRange}
                    </Typography>
                </Box>

                {/* Optional reason textarea */}
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
                        fullWidth
                        sx={styles.reasonTextField}
                    />
                </Box>

                {/* Approve / Decline buttons */}
                <Box sx={styles.buttonRow}>
                    <Button
                        variant="contained"
                        startIcon={<CheckIcon sx={styles.buttonIcon} />}
                        onClick={() => onApprove(request.id, reason)}
                        sx={styles.approveButton}
                    >
                        <Typography sx={styles.buttonLabel}>Approve</Typography>
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<CloseIcon sx={styles.buttonIcon} />}
                        onClick={() => onDecline(request.id, reason)}
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
    const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_REQUESTS);

    function handleApprove(id: number, reason: string) {
        // TODO: POST /api/leave-requests/{id}/approve  { reason }
        setRequests((prev) => prev.filter((r) => r.id !== id));
    }

    function handleDecline(id: number, reason: string) {
        // TODO: POST /api/leave-requests/{id}/decline  { reason }
        setRequests((prev) => prev.filter((r) => r.id !== id));
    }

    return (
        <Box sx={styles.pageContainer}>
            <SectionNavBar tabs={CALENDAR_TABS} />

            {/* Request cards or empty state */}
            {requests.length === 0 ? (
                <Box sx={styles.emptyState}>
                    <Typography sx={styles.emptyStateText}>
                        No pending requests
                    </Typography>
                </Box>
            ) : (
                requests.map((request) => (
                    <LeaveRequestCard
                        key={request.id}
                        request={request}
                        onApprove={handleApprove}
                        onDecline={handleDecline}
                    />
                ))
            )}
        </Box>
    );
}