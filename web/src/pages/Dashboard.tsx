import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getDashboardSummary,
         getLateArrivals,
         type LateArrivalsResponse,
         getDocumentSignatures,
         type DocumentSignaturesResponse
    } from "../logic/DashboardService";
import { useAuth } from "../AuthContext";
import { dashboardStyles as styles } from "./Dashboard.style";

type DashboardSummary = {
    pendingSignatures: number;
    lateThisWeek: number;
    openHazards: number;
};

export function Dashboard() {
    const { authenticationService } = useAuth();
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [lateData, setLateData] = useState<LateArrivalsResponse | null>(null);
    const [documentSignatureData, setDocumentSignatureData] = useState<DocumentSignaturesResponse | null>(null);

    useEffect(() => {
        getDashboardSummary(authenticationService).then((response: DashboardSummary) => {
            setData({
                pendingSignatures: response?.pendingSignatures ?? 0,
                lateThisWeek: response?.lateThisWeek ?? 0,
                openHazards: response?.openHazards ?? 0,
            });
        });
    }, [authenticationService]);

    useEffect(() => {
        getLateArrivals(authenticationService).then((response) => {
            setLateData(response);
        });
    }, [authenticationService]);

    useEffect(() => {
        getDocumentSignatures(authenticationService).then((response) => {
            setDocumentSignatureData({
                signed: response?.signed ?? 0,
                pending: response?.pending ?? 0,
            });
        });
    }, [authenticationService]);

    if (data === null) {
        return null;
    }

    return (
        <Box sx={styles.pageContainer}>
            <Box sx={styles.topCardsContainer}>
                <Paper elevation={0} sx={styles.card}>
                    <Box sx={styles.cardTopRow}>
                        <Box sx={{ ...styles.iconWrapper, ...styles.documentIconWrapper }}>
                            <DescriptionOutlinedIcon sx={{ ...styles.icon, ...styles.documentIcon }} />
                        </Box>

                        <Box sx={styles.trendRow}>
                            <TrendingDownIcon sx={styles.trendDownIcon} />
                            <Typography sx={styles.trendDownText}>-5</Typography>
                        </Box>
                    </Box>

                    <Typography sx={styles.valueText}>
                        {data.pendingSignatures}
                    </Typography>
                    <Typography sx={styles.labelText}>
                        Pending Signatures
                    </Typography>
                </Paper>

                <Paper elevation={0} sx={styles.card}>
                    <Box sx={styles.cardTopRow}>
                        <Box sx={{ ...styles.iconWrapper, ...styles.lateIconWrapper }}>
                            <AccessTimeOutlinedIcon sx={{ ...styles.icon, ...styles.lateIcon }} />
                        </Box>

                        <Box sx={styles.trendRow}>
                            <TrendingUpIcon sx={styles.trendUpIcon} />
                            <Typography sx={styles.trendUpText}>+2</Typography>
                        </Box>
                    </Box>

                    <Typography sx={styles.valueText}>
                        {data.lateThisWeek}
                    </Typography>
                    <Typography sx={styles.labelText}>
                        Lates this Week
                    </Typography>
                </Paper>

                <Paper elevation={0} sx={styles.card}>
                    <Box sx={styles.cardTopRow}>
                        <Box sx={{ ...styles.iconWrapper, ...styles.hazardIconWrapper }}>
                            <WarningAmberRoundedIcon sx={{ ...styles.icon, ...styles.hazardIcon }} />
                        </Box>

                        <Box sx={styles.trendRow}>
                            <TrendingDownIcon sx={styles.trendDownIcon} />
                            <Typography sx={styles.trendDownText}>-2</Typography>
                        </Box>
                    </Box>

                    <Typography sx={styles.valueText}>
                        {data.openHazards}
                    </Typography>
                    <Typography sx={styles.labelText}>
                        Open Hazards
                    </Typography>
                </Paper>
            </Box>

            {lateData !== null && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">
                        Late Arrivals Chart Data
                    </Typography>

                    <Typography>
                        Total: {lateData.total}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                        {lateData.points.map((point) => (
                            <Typography key={point.label}>
                                {point.label}: {point.value}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            )}

            {documentSignatureData !== null && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">
                        Document Signatures
                    </Typography>

                    <Typography>
                        Signed: {documentSignatureData.signed}
                    </Typography>

                    <Typography>
                        Pending: {documentSignatureData.pending}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
