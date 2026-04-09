import { Box, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import { sectionNavBarStyles as styles } from "./SectionNavbar.styles"

// Describes a single tab in the navigation bar
export interface SectionNavTab {
    label: string;
    route: string;
    alert?: boolean;
    /** Optional live count shown as a red badge beside the label */
    count?: number;
}

interface SectionNavBarProps {
    tabs: SectionNavTab[];
}

// Horizontally arranged row of labelled nav cards, one per section tab
export function SectionNavBar({ tabs }: SectionNavBarProps) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <Box sx={styles.row}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.route;
                return (
                    <Box
                        key={tab.route}
                        onClick={() => navigate(tab.route)}
                        sx={{
                            ...styles.card,
                            ...(tab.alert ? styles.cardAlert : {}),
                            ...(isActive ? styles.cardActive : {}),
                        }}
                    >
                        <Box sx={styles.labelRow}>
                            <Typography sx={styles.label}>{tab.label}</Typography>
                            {tab.count !== undefined && (
                                <Box sx={styles.badge}>
                                    <Typography sx={styles.badgeText}>
                                        {tab.count}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}