import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    IconButton,
} from "@mui/material";
import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { useAuth } from "../AuthContext";
import {
    getHazardsForRiskAssessment,
    type HazardItem,
} from "../logic/ReviewSubmissionsService";
import { riskAssessmentHazardsStyles as styles } from "./RiskAssessmentHazardsPage.styles";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function formatCreatedDate(iso: string): string {
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

export function RiskAssessmentHazardsPage() {
    const { authenticationService } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [hazards, setHazards] = useState<HazardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHazards = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getHazardsForRiskAssessment(
                authenticationService,
                Number(id)
            );
            // Filter out drafts on the admin side
            setHazards(data.filter((h) => !h.draft));
        } catch {
            setError("Failed to load hazards. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [authenticationService, id]);

    useEffect(() => {
        loadHazards();
    }, [loadHazards]);

    return (
        <Box sx={styles.pageContainer}>
            <SectionNavBar tabs={NAV_TABS} />

            <Box sx={styles.sectionCard}>
                {/* Header row: back button + title */}
                <Box sx={styles.headerRow}>
                    <IconButton
                        onClick={() => navigate("/health-and-safety/review")}
                        sx={styles.backButton}
                    >
                        <ArrowBackIosNewRoundedIcon sx={styles.backIcon} />
                    </IconButton>
                    <Typography sx={styles.sectionTitle}>
                        Hazards
                    </Typography>
                </Box>

                {/* Error */}
                {!loading && error !== null && (
                    <Typography sx={styles.errorText}>{error}</Typography>
                )}

                {/* Hazard list */}
                {!loading && error === null && (
                    <Box sx={styles.scrollList}>
                        {hazards.length === 0 ? (
                            <Box sx={styles.emptyState}>
                                <CheckCircleOutlineRoundedIcon sx={styles.emptyStateIcon} />
                                <Typography sx={styles.emptyStateText}>
                                    No hazards found for this assessment
                                </Typography>
                            </Box>
                        ) : (
                            hazards.map((hazard) => (
                                <Box
                                    key={hazard.hazardId}
                                    sx={styles.hazardRow}
                                    onClick={() =>
                                        navigate(
                                            `/health-and-safety/review/hazard/${hazard.hazardId}`
                                        )
                                    }
                                >
                                    {/* Icon */}
                                    <Box
                                        sx={{
                                            ...styles.iconWrapper,
                                            ...(hazard.closed
                                                ? styles.iconWrapperGreen
                                                : styles.iconWrapperAmber),
                                        }}
                                    >
                                        <WarningAmberRoundedIcon
                                            sx={{
                                                ...styles.icon,
                                                ...(hazard.closed
                                                    ? styles.iconGreen
                                                    : styles.iconAmber),
                                            }}
                                        />
                                    </Box>

                                    {/* Text */}
                                    <Box sx={styles.textBlock}>
                                        <Typography sx={styles.hazardTitle}>
                                            {hazard.title}
                                        </Typography>
                                        <Typography sx={styles.assessorName}>
                                            {hazard.createdBy}
                                        </Typography>
                                        <Typography sx={styles.dateText}>
                                            {formatCreatedDate(hazard.created)}
                                        </Typography>
                                    </Box>

                                    {/* Status badge */}
                                    <Box
                                        sx={{
                                            ...styles.statusBadge,
                                            ...(hazard.closed
                                                ? styles.statusBadgeGreen
                                                : styles.statusBadgeAmber),
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                ...styles.statusBadgeText,
                                                ...(hazard.closed
                                                    ? styles.statusBadgeTextGreen
                                                    : styles.statusBadgeTextAmber),
                                            }}
                                        >
                                            {hazard.closed ? "Closed" : "Submitted"}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}