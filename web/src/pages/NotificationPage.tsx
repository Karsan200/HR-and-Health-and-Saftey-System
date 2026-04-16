import { Box, Typography, Button } from "@mui/material";
import { notificationPageStyles as styles } from "./NotificationPage.styles";
import { getRecentActivity, type RecentActivityItemResponse } from "../logic/DashboardService";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

const getActivityDisplay = (type: string): { label: string; colorKey: "leave" | "signed" | "late" | "hazard" | "default" } => {
    switch (type) {
        case "DOCUMENT_SIGNED":
            return { label: "Document Signed", colorKey: "signed" };
        case "LEAVE_REQUEST":
            return { label: "Requested Leave", colorKey: "leave" };
        case "HAZARD_REPORTED":
            return { label: "Hazard Reported", colorKey: "hazard" };
        case "LATE_CLOCK_IN":
            return { label: "Late Clock In", colorKey: "late" };
        default:
            return { label: type, colorKey: "default" };
    }
};

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
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
                <Box sx={styles.header}>
                    <Box>
                        <Typography sx={styles.title}>Notifications</Typography>
                        <Typography sx={styles.subtitle}>
                            Stay up to date with important system alerts
                        </Typography>
                    </Box>
                    <Button sx={styles.markAllButton} variant="contained" disableElevation>
                        Mark all as read
                    </Button>
                </Box>

                {recentActivityData !== null && (
                    <Box>
                        <Typography sx={styles.sectionHeader}>
                            Recent Activity
                        </Typography>

                        <Box sx={styles.notificationList}>
                            {recentActivityData.map((item, index) => {
                                const { label, colorKey } = getActivityDisplay(item.type);

                                return (
                                    <Box
                                        key={`${item.type}-${item.created}-${index}`}
                                        sx={styles.notificationCard}
                                    >
                                        <Typography sx={styles.typeLabel(colorKey)}>
                                            {label}
                                        </Typography>
                                        <Typography sx={styles.message}>
                                            {item.message}
                                        </Typography>
                                        <Typography sx={styles.timestamp}>
                                            {formatTimeAgo(item.created)}
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