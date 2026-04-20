import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, Divider } from "@mui/material";
import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { useAuth } from "../AuthContext";
import { getHazardById, type HazardReportItem } from "../logic/ReviewSubmissionsService";
import { hazardViewStyles as styles } from "./HazardViewPage.styles";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";

const NAV_TABS: SectionNavTab[] = [
    { label: "Upload and Send Documents", route: "/health-and-safety/send-out" },
    { label: "Review Submissions", route: "/health-and-safety/review" },
];

function formatDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

interface ReadOnlyFieldProps {
    label: string;
    value: string;
}

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
    return (
        <Box sx={styles.fieldWrapper}>
            <Typography sx={styles.fieldLabel}>{label}</Typography>
            <Box sx={styles.fieldBox}>
                <Typography sx={styles.fieldValue}>{value || "—"}</Typography>
            </Box>
        </Box>
    );
}

export function HazardViewPage() {
    const { authenticationService } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [hazard, setHazard] = useState<HazardReportItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHazard = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getHazardById(authenticationService, Number(id));
            setHazard(data);
        } catch {
            setError("Failed to load hazard. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [authenticationService, id]);

    useEffect(() => {
        loadHazard();
    }, [loadHazard]);

    return (
        <Box sx={styles.pageContainer}>
            <SectionNavBar tabs={NAV_TABS} />

            {!loading && error !== null && (
                <Typography sx={styles.errorText}>{error}</Typography>
            )}

            {!loading && error === null && hazard !== null && (
                <>
                    {/* ── Assessment Information card ── */}
                    <Box sx={styles.sectionCard}>
                        <Box sx={styles.headerRow}>
                            <IconButton
                                onClick={() => navigate(-1)}
                                sx={styles.backButton}
                            >
                                <ArrowBackIosNewRoundedIcon sx={styles.backIcon} />
                            </IconButton>
                            <Typography sx={styles.sectionTitle}>
                                Assessment Information
                            </Typography>
                        </Box>

                        <ReadOnlyField
                            label="Assessment Title"
                            value={hazard.title}
                        />

                        {/* Submitted by + date row */}
                        <Box sx={styles.metaRow}>
                            <Box sx={styles.metaItem}>
                                <Typography sx={styles.fieldLabel}>Submitted by</Typography>
                                <Box sx={styles.fieldBox}>
                                    <Typography sx={styles.fieldValue}>
                                        {hazard.createdBy}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={styles.metaItem}>
                                <Typography sx={styles.fieldLabel}>Date submitted</Typography>
                                <Box sx={styles.fieldBox}>
                                    <Typography sx={styles.fieldValue}>
                                        {formatDate(hazard.created)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* ── Hazard Detail card ── */}
                    <Box sx={styles.sectionCard}>
                        <Typography sx={styles.sectionTitle}>Hazard</Typography>
                        <Divider sx={styles.divider} />

                        <ReadOnlyField
                            label="What are the hazards?"
                            value={hazard.questionOne}
                        />
                        <ReadOnlyField
                            label="Who might be harmed and how?"
                            value={hazard.questionTwo}
                        />
                        <ReadOnlyField
                            label="What are you doing to control the risk?"
                            value={hazard.questionThree}
                        />
                        <ReadOnlyField
                            label="What further actions do you need to take to control the risk?"
                            value={hazard.questionFour}
                        />
                        <ReadOnlyField
                            label="Who needs to carry out the action?"
                            value={hazard.questionFive}
                        />
                        <ReadOnlyField
                            label="When is the action needed by?"
                            value={hazard.questionSix ? formatDate(hazard.questionSix) : "—"}
                        />

                        {/* Photos */}
                        {hazard.fileUrls.length > 0 && (
                            <Box sx={styles.fieldWrapper}>
                                <Typography sx={styles.fieldLabel}>Photos</Typography>
                                <Box sx={styles.photoGrid}>
                                    {hazard.fileUrls.map((url) => (
                                        <Box
                                            key={url}
                                            component="img"
                                            src={url}
                                            sx={styles.photo}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Action completed checkbox (read only) */}
                        <Box sx={styles.checkboxRow}>
                            {hazard.closed ? (
                                <CheckBoxRoundedIcon sx={styles.checkboxIcon} />
                            ) : (
                                <CheckBoxOutlineBlankRoundedIcon sx={styles.checkboxIconUnchecked} />
                            )}
                            <Typography sx={styles.checkboxLabel}>
                                Action completed
                            </Typography>
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}