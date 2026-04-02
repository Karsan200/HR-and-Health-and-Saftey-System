import { Box, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import { sectionNavBarStyles as styles } from "./SectionNavbar.styles"

// Describes a single tab in the navigation bar
export interface SectionNavTab {
    label: string;
    route: string;
    alert?: boolean;
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
                        <Typography sx={styles.label}>{tab.label}</Typography>
                    </Box>
                );
            })}
        </Box>
    );
}