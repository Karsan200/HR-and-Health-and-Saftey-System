import { useCallback, useEffect, useState } from "react";
import {
    Box,
    Typography,
} from "@mui/material";
import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { useAuth } from "../AuthContext";
import {
    getPendingSignatures, getRiskAssessments,
    type PendingSignatureItem, type RiskAssessmentItem,
} from "../logic/ReviewSubmissionsService";
import { reviewSubmissionsStyles as styles } from "./ReviewSubmissionsPage.styles";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ContentPasteOutlinedIcon from "@mui/icons-material/ContentPasteOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { Button } from "@mui/material";
import {useNavigate} from "react-router-dom";

/** Format an ISO date string as "Sent: 5 February 2026" */
function formatSentDate(iso: string): string {
    const date = new Date(iso);
    return `Sent: ${date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })}`;
}

function formatSubmittedDate(iso: string): string {
    const date = new Date(iso);
    return `Submitted: ${date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })}`;
}

const NAV_TABS: SectionNavTab[] = [
    { label: "Upload and Send Documents", route: "/health-and-safety/send-out" },
    { label: "Review Submissions", route: "/health-and-safety/review" },
];

export function ReviewSubmissionsPage() {
    const { authenticationService } = useAuth();

    const [pendingSignatures, setPendingSignatures] = useState<PendingSignatureItem[]>([]);
    const [riskAssessments, setRiskAssessments] = useState<RiskAssessmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [signatures, assessments] = await Promise.all([
                getPendingSignatures(authenticationService),
                getRiskAssessments(authenticationService),
            ]);

            setPendingSignatures(signatures);
            setRiskAssessments(assessments);
        } catch {
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [authenticationService]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <Box sx={styles.pageContainer}>
            {/* Section navigation shared with the Send Out Documents page */}
            <SectionNavBar tabs={NAV_TABS} />

            {/* ── Document Signatures card ── */}
            <Box sx={styles.sectionCard}>
                <Typography sx={styles.sectionTitle}>
                    Document Signatures
                </Typography>

                {/* Error state */}
                {!loading && error !== null && (
                    <Typography sx={styles.errorText}>{error}</Typography>
                )}

                {/* Scrollable signature list */}
                {!loading && error === null && (
                    <Box sx={styles.scrollList}>
                        {pendingSignatures.length === 0 ? (
                            /* Empty state */
                            <Box sx={styles.emptyState}>
                                <CheckCircleOutlineRoundedIcon sx={styles.emptyStateIcon} />
                                <Typography sx={styles.emptyStateText}>
                                    All signatures are up to date
                                </Typography>
                            </Box>
                        ) : (
                            pendingSignatures.map((item) => (
                                <Box
                                    key={`${item.accountId}-${item.documentId}`}
                                    sx={styles.signatureRow}
                                >
                                    {/* Document icon */}
                                    <Box sx={styles.iconWrapper}>
                                        <DescriptionOutlinedIcon sx={styles.icon} />
                                    </Box>

                                    {/* Name + document title + sent date */}
                                    <Box sx={styles.textBlock}>
                                        <Typography sx={styles.personName}>
                                            {item.fullName}
                                        </Typography>
                                        <Typography sx={styles.documentTitle}>
                                            {item.documentTitle}
                                        </Typography>
                                        <Typography sx={styles.sentDate}>
                                            {formatSentDate(item.sentDate)}
                                        </Typography>
                                    </Box>

                                    {/* Pending badge */}
                                    <Box sx={styles.pendingBadge}>
                                        <Typography sx={styles.pendingBadgeText}>
                                            Pending
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>

            {/* ── Risk Assessments card ── */}
            <Box sx={styles.sectionCard}>
                <Typography sx={styles.sectionTitle}>
                    Risk Assessments
                </Typography>

                {!loading && error === null && (
                    <Box sx={styles.scrollList}>
                        {riskAssessments.length === 0 ? (
                            <Box sx={styles.emptyState}>
                                <CheckCircleOutlineRoundedIcon sx={styles.emptyStateIcon} />
                                <Typography sx={styles.emptyStateText}>
                                    No risk assessments found
                                </Typography>
                            </Box>
                        ) : (
                            riskAssessments.map((item) => {
                                const hasOpenActions = !item.allActionsComplete;
                                return (
                                    <Box
                                        key={item.riskAssessmentId}
                                        sx={styles.signatureRow}
                                    >
                                        {/* Clipboard icon */}
                                        <Box
                                            sx={{
                                                ...styles.riskIconWrapper,
                                                ...(hasOpenActions
                                                    ? styles.riskIconAmber
                                                    : styles.riskIconGreen),
                                            }}
                                        >
                                            <ContentPasteOutlinedIcon
                                                sx={{
                                                    ...styles.riskIcon,
                                                    ...(hasOpenActions
                                                        ? styles.riskIconAmberColor
                                                        : styles.riskIconGreenColor),
                                                }}
                                            />
                                        </Box>

                                        {/* Text */}
                                        <Box sx={styles.textBlock}>
                                            <Typography sx={styles.personName}>
                                                {item.title}
                                            </Typography>
                                            <Typography sx={styles.documentTitle}>
                                                {item.activeHazardCount} hazards identified
                                            </Typography>
                                            <Typography sx={styles.sentDate}>
                                                {formatSubmittedDate(item.created)}
                                            </Typography>
                                        </Box>

                                        {/* Action button */}
                                        <Button
                                            variant="contained"
                                            startIcon={<RemoveRedEyeOutlinedIcon />}
                                            sx={{
                                                ...styles.riskButton,
                                                ...(hasOpenActions
                                                    ? styles.riskButtonRed
                                                    : styles.riskButtonGrey),
                                            }}
                                            onClick={() => navigate(`/health-and-safety/review/risk-assessment/${item.riskAssessmentId}`)}
                                        >
                                            {hasOpenActions ? "Review now" : "Read again"}
                                        </Button>
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}