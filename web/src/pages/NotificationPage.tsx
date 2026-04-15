import { Box, Typography } from "@mui/material";
import { notificationPageStyles as styles } from "./NotificationPage.styles";
import { getRecentActivity, type RecentActivityItemResponse, } from "../logic/DashboardService";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.tsx";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

const getRecentActivityDisplay = (type: string) => {
    switch (type) {
        case "DOCUMENT_SIGNED":
            return {
                icon: <CheckCircleOutlineRoundedIcon />,
            };

        case "LEAVE_REQUEST":
            return {
                icon: <AccessTimeRoundedIcon />,
            };

        case "HAZARD_REPORTED":
            return {
                icon: <ReportProblemOutlinedIcon />,
            };

        case "LATE_CLOCK_IN":
            return {
                icon: <AccessTimeRoundedIcon />,
            };

        default:
            return {
                icon: <AccessTimeRoundedIcon />,
            };
    }
};

export function NotificationPage() {
    const { authenticationService } = useAuth();
    const [recentActivityData, setRecentActivityData] = useState<RecentActivityItemResponse[] | null>(null);

    useEffect(() => {
        getRecentActivity(authenticationService).then((response) => {
            setRecentActivityData(response ?? []);
        });
    }, [authenticationService]);

    return (
        <Box sx={styles.page}>
            <Box sx={styles.pageContainer}>
                {recentActivityData !== null && (
                    <Box>
                        <Typography>
                            Recent Activity
                        </Typography>

                        <Box>
                            {recentActivityData.map((item, index) => {
                                const activityDisplay = getRecentActivityDisplay(item.type);

                                return (
                                    <Box
                                        key={`${item.type}-${item.created}-${index}`}
                                    >
                                        <Box>
                                            {activityDisplay.icon}
                                        </Box>

                                        <Typography>
                                            {item.message}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}