import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getDashboardSummary } from "../logic/DashboardService";
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

    // Fetch the dashboard summary data, and defaulting to 0 for any missing values
    useEffect(() => {
        getDashboardSummary(authenticationService).then((response: DashboardSummary) => {
            setData({
                pendingSignatures: response?.pendingSignatures ?? 0,
                lateThisWeek: response?.lateThisWeek ?? 0,
                openHazards: response?.openHazards ?? 0,
            });
        });
    }, [authenticationService]);

    if (data === null) {
        return null;
    }

    return (
        <Box sx={styles.pageContainer}>
            {/* The top 3 cards that show the key summary data */}
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
        </Box>
    );
}
