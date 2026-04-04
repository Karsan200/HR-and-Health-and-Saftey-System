import { useEffect, useMemo, useState } from "react";
import {
    Box,
    FormControl,
    MenuItem,
    Paper,
    Select,
    Typography,
    type SelectChangeEvent,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import {
    getDashboardSummary,
    getLateArrivals,
    type LateArrivalsResponse,
    getDocumentSignatures,
    type DocumentSignaturesResponse,
    getHazardsReported,
    type HazardsReportedResponse,
} from "../logic/DashboardService";
import { useAuth } from "../AuthContext";
import { dashboardStyles as styles } from "./Dashboard.style";

type DashboardSummary = {
    pendingSignatures: number;
    lateThisWeek: number;
    openHazards: number;
};

const lateArrivalRangeOptions = [
    { value: "this-week", label: "This Week" },
    { value: "last-week", label: "Last Week" },
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "last-3-months", label: "Last 3 Months" },
    { value: "last-6-months", label: "Last 6 Months" },
    { value: "this-year", label: "This Year" },
] as const;

const lateArrivalTitleMap: Record<string, string> = {
    "this-week": "Late Arrivals This Week",
    "last-week": "Late Arrivals Last Week",
    "this-month": "Late Arrivals This Month",
    "last-month": "Late Arrivals Last Month",
    "last-3-months": "Late Arrivals Last 3 Months",
    "last-6-months": "Late Arrivals Last 6 Months",
    "this-year": "Late Arrivals This Year",
};

const dayLabelMap: Record<string, string> = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
};

export function Dashboard() {
    const { authenticationService } = useAuth();

    const [data, setData] = useState<DashboardSummary | null>(null);
    const [lateData, setLateData] = useState<LateArrivalsResponse | null>(null);
    const [lateArrivalsRange, setLateArrivalsRange] = useState("this-week");

    const [documentSignatureData, setDocumentSignatureData] =
        useState<DocumentSignaturesResponse | null>(null);
    const [hazardsReportedData, setHazardsReportedData] =
        useState<HazardsReportedResponse | null>(null);

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
        getLateArrivals(authenticationService, lateArrivalsRange).then((response) => {
            setLateData({
                range: response?.range ?? lateArrivalsRange,
                total: response?.total ?? 0,
                points: response?.points ?? [],
            });
        });
    }, [authenticationService, lateArrivalsRange]);

    useEffect(() => {
        getDocumentSignatures(authenticationService).then((response) => {
            setDocumentSignatureData({
                signed: response?.signed ?? 0,
                pending: response?.pending ?? 0,
            });
        });
    }, [authenticationService]);

    useEffect(() => {
        getHazardsReported(authenticationService).then((response) => {
            setHazardsReportedData({
                range: response?.range ?? "this-week",
                total: response?.total ?? 0,
                points: response?.points ?? [],
            });
        });
    }, [authenticationService]);

    const lateChartMaxValue = useMemo(() => {
        const values = lateData?.points.map((point) => point.value) ?? [];
        return Math.max(...values, 1);
    }, [lateData]);

    const lateChartTicks = useMemo(() => {
        return Array.from({ length: lateChartMaxValue + 1 }, (_, index) => lateChartMaxValue - index);
    }, [lateChartMaxValue]);

    const lateArrivalsTitle = useMemo(() => {
        return lateArrivalTitleMap[lateArrivalsRange] ?? "Late Arrivals";
    }, [lateArrivalsRange]);

    const formattedLatePoints = useMemo(() => {
        return (
            lateData?.points.map((point) => ({
                ...point,
                displayLabel: dayLabelMap[point.label] ?? point.label,
            })) ?? []
        );
    }, [lateData]);

    if (data === null) {
        return null;
    }

    return (
        <Box sx={styles.pageContainer}>
            <Box sx={styles.dashboardContent}>
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
                    <Paper elevation={0} sx={styles.lateChartCard}>
                        <Box sx={styles.lateChartHeader}>
                            <Box sx={styles.lateChartHeaderText}>
                                <Typography sx={styles.lateChartTitle}>
                                    {lateArrivalsTitle}
                                </Typography>
                                <Typography sx={styles.lateChartSubtitle}>
                                    Employee Lateness
                                </Typography>
                            </Box>

                            <FormControl size="small" sx={styles.lateChartSelectControl}>
                                <Select
                                    value={lateArrivalsRange}
                                    onChange={(event: SelectChangeEvent) =>
                                        setLateArrivalsRange(event.target.value)
                                    }
                                    IconComponent={KeyboardArrowDownRoundedIcon}
                                    sx={styles.lateChartSelect}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: styles.lateChartSelectMenuPaper,
                                        },
                                    }}
                                >
                                    {lateArrivalRangeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Typography sx={styles.lateChartTotalText}>
                            {lateData.total} Total
                        </Typography>

                        <Box sx={styles.lateChartBody}>
                            <Box sx={styles.lateChartYAxis}>
                                {lateChartTicks.map((tick) => (
                                    <Box key={tick} sx={styles.lateChartYAxisRow}>
                                        <Typography sx={styles.lateChartYAxisLabel}>
                                            {tick}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={styles.lateChartPlotArea}>
                                <Box sx={styles.lateChartBarsRow}>
                                    {formattedLatePoints.map((point) => {
                                        const heightPercent = lateChartMaxValue === 0
                                            ? 0
                                            : (point.value / lateChartMaxValue) * 100;

                                        return (
                                            <Box key={point.label} sx={styles.lateChartBarColumn}>
                                                <Box sx={styles.lateChartBarTrack}>
                                                    <Box
                                                        sx={{
                                                            ...styles.lateChartBarFill,
                                                            height: `${heightPercent}%`,
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                <Box sx={styles.lateChartXAxisLabelsRow}>
                                    {formattedLatePoints.map((point) => (
                                        <Box key={point.label} sx={styles.lateChartXAxisLabelColumn}>
                                            <Typography sx={styles.lateChartXAxisLabel}>
                                                {point.displayLabel}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
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

                {hazardsReportedData !== null && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">
                            Hazards Reported
                        </Typography>

                        <Typography>
                            Total: {hazardsReportedData.total}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                            {hazardsReportedData.points.map((point) => (
                                <Typography key={point.label}>
                                    {point.label}: {point.value}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
