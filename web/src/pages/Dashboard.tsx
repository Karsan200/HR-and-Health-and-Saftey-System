import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
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
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import {
    getDashboardSummary,
    getLateArrivals,
    type LateArrivalsResponse,
    getDocumentSignatures,
    type DocumentSignaturesResponse,
    getHazardsReported,
    type HazardsReportedResponse,
    getRecentActivity,
    type RecentActivityItemResponse,
} from "../logic/DashboardService";
import { useAuth } from "../AuthContext";
import {
    dashboardStyles as styles,
    HAZARDS_CHART_BOTTOM_PADDING,
    HAZARDS_CHART_HEIGHT,
    HAZARDS_CHART_LEFT_PADDING,
    HAZARDS_CHART_RIGHT_PADDING,
    HAZARDS_CHART_TOP_PADDING,
    HAZARDS_CHART_WIDTH,
    HAZARDS_TICK_COUNT,
} from "./Dashboard.style";

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

const createSmoothPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) {
        return "";
    }

    if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let index = 0; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];

        const controlPointOffset = (next.x - current.x) / 2;

        path += ` C ${current.x + controlPointOffset} ${current.y}, ${next.x - controlPointOffset} ${next.y}, ${next.x} ${next.y}`;
    }

    return path;
};

const formatChartTick = (value: number) => {
    if (Number.isInteger(value)) {
        return value.toString();
    }

    return value.toFixed(1).replace(/\.0$/, "");
};

const getNiceHazardsStep = (maxValue: number, segmentCount: number) => {
    if (maxValue <= 0) {
        return 1;
    }

    const roughStep = maxValue / segmentCount;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const normalized = roughStep / magnitude;

    if (normalized <= 1) {
        return magnitude;
    }

    if (normalized <= 2) {
        return 2 * magnitude;
    }

    if (normalized <= 5) {
        return 5 * magnitude;
    }

    return 10 * magnitude;
};

export function Dashboard() {
    const { authenticationService } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState<DashboardSummary | null>(null);
    const [lateData, setLateData] = useState<LateArrivalsResponse | null>(null);
    const [lateArrivalsRange, setLateArrivalsRange] = useState("this-week");

    const [documentSignaturesRange, setDocumentSignaturesRange] = useState("this-week");
    const [documentSignatureData, setDocumentSignatureData] =
        useState<DocumentSignaturesResponse | null>(null);
    const [hazardsReportedData, setHazardsReportedData] =
        useState<HazardsReportedResponse | null>(null);
    const [hazardsReportedRange, setHazardsReportedRange] = useState("this-week");
    const [recentActivityData, setRecentActivityData] = useState<RecentActivityItemResponse[] | null>(null);

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
        getDocumentSignatures(authenticationService, documentSignaturesRange).then((response) => {
            setDocumentSignatureData({
                signed: response?.signed ?? 0,
                pending: response?.pending ?? 0,
            });
        });
    }, [authenticationService, documentSignaturesRange]);

    useEffect(() => {
        getHazardsReported(authenticationService, hazardsReportedRange).then((response) => {
            setHazardsReportedData({
                range: response?.range ?? hazardsReportedRange,
                total: response?.total ?? 0,
                points: response?.points ?? [],
            });
        });
    }, [authenticationService, hazardsReportedRange]);

    useEffect(() => {
        getRecentActivity(authenticationService).then((response) => {
            setRecentActivityData(response ?? []);
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

    const documentSignaturesTitle = useMemo(() => {
        return "Document Signatures";
    }, []);

    const documentSignatureTotal = useMemo(() => {
        return (documentSignatureData?.signed ?? 0) + (documentSignatureData?.pending ?? 0);
    }, [documentSignatureData]);

    const documentSignatureSignedPercentage = useMemo(() => {
        if (documentSignatureTotal === 0) {
            return 0;
        }

        return ((documentSignatureData?.signed ?? 0) / documentSignatureTotal) * 100;
    }, [documentSignatureData, documentSignatureTotal]);

    const documentSignatureChartBackground = useMemo(() => {
        if (documentSignatureTotal === 0) {
            return `conic-gradient(${styles.documentSignatureEmptyRingColour} 0deg 360deg)`;
        }

        const signedDegrees = (documentSignatureSignedPercentage / 100) * 360;

        return `conic-gradient(
        ${styles.documentSignatureSignedColour} 0deg ${signedDegrees}deg,
        ${styles.documentSignaturePendingColour} ${signedDegrees}deg 360deg
    )`;
    }, [documentSignatureSignedPercentage, documentSignatureTotal]);

    const hazardsReportedValues = useMemo(() => {
        return hazardsReportedData?.points.map((point) => point.value) ?? [];
    }, [hazardsReportedData]);

    const hazardsReportedMaxValue = useMemo(() => {
        if (hazardsReportedValues.length === 0) {
            return 0;
        }

        return Math.max(...hazardsReportedValues);
    }, [hazardsReportedValues]);

    const hazardsReportedAxisMinValue = 0;

    const hazardsReportedStepValue = useMemo(() => {
        return getNiceHazardsStep(hazardsReportedMaxValue, HAZARDS_TICK_COUNT - 1);
    }, [hazardsReportedMaxValue]);

    const hazardsReportedAxisMaxValue = useMemo(() => {
        const minimumAxisMax = hazardsReportedStepValue * (HAZARDS_TICK_COUNT - 1);

        if (hazardsReportedMaxValue <= 0) {
            return minimumAxisMax;
        }

        return Math.max(
            minimumAxisMax,
            Math.ceil(hazardsReportedMaxValue / hazardsReportedStepValue) * hazardsReportedStepValue,
        );
    }, [hazardsReportedMaxValue, hazardsReportedStepValue]);

    const hazardsReportedTicks = useMemo(() => {
        return Array.from({ length: HAZARDS_TICK_COUNT }, (_, index) => {
            return hazardsReportedAxisMaxValue - hazardsReportedStepValue * index;
        });
    }, [hazardsReportedAxisMaxValue, hazardsReportedStepValue]);

    const hazardsReportedChartPoints = useMemo(() => {
        const usableWidth =
            HAZARDS_CHART_WIDTH - HAZARDS_CHART_LEFT_PADDING - HAZARDS_CHART_RIGHT_PADDING;
        const usableHeight =
            HAZARDS_CHART_HEIGHT - HAZARDS_CHART_TOP_PADDING - HAZARDS_CHART_BOTTOM_PADDING;

        const points = hazardsReportedData?.points ?? [];
        const axisRange = hazardsReportedAxisMaxValue - hazardsReportedAxisMinValue || 1;

        return points.map((point, index) => {
            const x =
                points.length <= 1
                    ? HAZARDS_CHART_LEFT_PADDING + usableWidth / 2
                    : HAZARDS_CHART_LEFT_PADDING +
                    (index * usableWidth) / (points.length - 1);

            const clampedValue = Math.max(hazardsReportedAxisMinValue, point.value);

            const y =
                HAZARDS_CHART_TOP_PADDING +
                ((hazardsReportedAxisMaxValue - clampedValue) / axisRange) * usableHeight;

            return {
                x,
                y,
                label: point.label,
                value: point.value,
            };
        });
    }, [hazardsReportedData, hazardsReportedAxisMaxValue]);

    const hazardsReportedPath = useMemo(() => {
        return createSmoothPath(hazardsReportedChartPoints);
    }, [hazardsReportedChartPoints]);

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

                {lateData !== null && documentSignatureData !== null && (
                    <Box sx={styles.chartRow}>
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

                        <Paper elevation={0} sx={styles.documentSignatureCard}>
                            <Box sx={styles.documentSignatureHeader}>
                                <Box sx={styles.documentSignatureHeaderText}>
                                    <Typography sx={styles.documentSignatureTitle}>
                                        {documentSignaturesTitle}
                                    </Typography>
                                    <Typography sx={styles.documentSignatureSubtitle}>
                                        Signature Completion Status
                                    </Typography>
                                </Box>

                                <FormControl size="small" sx={styles.documentSignatureSelectControl}>
                                    <Select
                                        value={documentSignaturesRange}
                                        onChange={(event: SelectChangeEvent) =>
                                            setDocumentSignaturesRange(event.target.value)
                                        }
                                        IconComponent={KeyboardArrowDownRoundedIcon}
                                        sx={styles.documentSignatureSelect}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: styles.documentSignatureSelectMenuPaper,
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

                            <Box sx={styles.documentSignatureBody}>
                                <Box sx={styles.documentSignatureDonutWrapper}>
                                    <Box
                                        sx={{
                                            ...styles.documentSignatureDonut,
                                            background: documentSignatureChartBackground,
                                        }}
                                    >
                                        <Box sx={styles.documentSignatureDonutInner} />
                                    </Box>
                                </Box>

                                <Box sx={styles.documentSignatureLegend}>
                                    <Box sx={styles.documentSignatureLegendRow}>
                                        <Box sx={styles.documentSignatureLegendLeft}>
                                            <Box
                                                sx={{
                                                    ...styles.documentSignatureLegendDot,
                                                    backgroundColor: styles.documentSignatureSignedColour,
                                                }}
                                            />
                                            <Typography sx={styles.documentSignatureLegendLabel}>
                                                Signed
                                            </Typography>
                                        </Box>

                                        <Typography sx={styles.documentSignatureLegendValue}>
                                            {documentSignatureData.signed}
                                        </Typography>
                                    </Box>

                                    <Box sx={styles.documentSignatureLegendRow}>
                                        <Box sx={styles.documentSignatureLegendLeft}>
                                            <Box
                                                sx={{
                                                    ...styles.documentSignatureLegendDot,
                                                    backgroundColor: styles.documentSignaturePendingColour,
                                                }}
                                            />
                                            <Typography sx={styles.documentSignatureLegendLabel}>
                                                Pending
                                            </Typography>
                                        </Box>

                                        <Typography sx={styles.documentSignatureLegendValue}>
                                            {documentSignatureData.pending}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                )}

                {hazardsReportedData !== null && (
                    <Box sx={styles.bottomRow}>
                        <Paper elevation={0} sx={styles.hazardsReportedCard}>
                            <Box sx={styles.hazardsReportedHeader}>
                                <Box sx={styles.hazardsReportedHeaderText}>
                                    <Typography sx={styles.hazardsReportedTitle}>
                                        Hazards Reported
                                    </Typography>
                                    <Typography sx={styles.hazardsReportedSubtitle}>
                                        Monthly Hazard Reports
                                    </Typography>
                                </Box>

                                <FormControl size="small" sx={styles.hazardsReportedSelectControl}>
                                    <Select
                                        value={hazardsReportedRange}
                                        onChange={(event: SelectChangeEvent) =>
                                            setHazardsReportedRange(event.target.value)
                                        }
                                        IconComponent={KeyboardArrowDownRoundedIcon}
                                        sx={styles.hazardsReportedSelect}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: styles.hazardsReportedSelectMenuPaper,
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

                            <Box sx={styles.hazardsReportedBody}>
                                <Box sx={styles.hazardsReportedYAxis}>
                                    {hazardsReportedTicks.map((tick, index) => (
                                        <Box key={`${tick}-${index}`} sx={styles.hazardsReportedYAxisRow}>
                                            <Typography sx={styles.hazardsReportedYAxisLabel}>
                                                {formatChartTick(tick)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                <Box sx={styles.hazardsReportedPlotArea}>
                                    <Box sx={styles.hazardsReportedGrid}>
                                        {hazardsReportedTicks.map((tick, index) => (
                                            <Box key={`${tick}-${index}`} sx={styles.hazardsReportedGridRow} />
                                        ))}
                                    </Box>

                                    <Box sx={styles.hazardsReportedSvgWrapper}>
                                        <svg
                                            viewBox={`0 0 ${HAZARDS_CHART_WIDTH} ${HAZARDS_CHART_HEIGHT}`}
                                            preserveAspectRatio="none"
                                            style={{ width: "100%", height: "100%" }}
                                        >
                                            {hazardsReportedChartPoints.map((point) => (
                                                <line
                                                    key={`vertical-${point.label}`}
                                                    x1={point.x}
                                                    y1={0}
                                                    x2={point.x}
                                                    y2={HAZARDS_CHART_HEIGHT}
                                                    stroke={styles.hazardsReportedVerticalGridColour}
                                                    strokeWidth="1"
                                                    strokeDasharray="3 4"
                                                />
                                            ))}

                                            <path
                                                d={hazardsReportedPath}
                                                fill="none"
                                                stroke={styles.hazardsReportedLineColour}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />

                                            {hazardsReportedChartPoints.map((point) => (
                                                <circle
                                                    key={point.label}
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r="4.5"
                                                    fill={styles.hazardsReportedLineColour}
                                                />
                                            ))}
                                        </svg>
                                    </Box>

                                    <Box sx={styles.hazardsReportedXAxisLabelsRow}>
                                        {(hazardsReportedData.points ?? []).map((point) => (
                                            <Box key={point.label} sx={styles.hazardsReportedXAxisLabelColumn}>
                                                <Typography sx={styles.hazardsReportedXAxisLabel}>
                                                    {point.label}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={styles.quickActionsCard}>
                            <Typography sx={styles.quickActionsTitle}>
                                Quick Actions
                            </Typography>

                            <Box sx={styles.quickActionsList}>
                                <Button
                                    fullWidth
                                    disableRipple
                                    onClick={() => navigate("/health-and-safety/send-out")}
                                    sx={styles.quickActionButton}
                                >
                                    <Box sx={{ ...styles.quickActionIconWrapper, ...styles.quickActionDocumentIconWrapper }}>
                                        <InsertDriveFileOutlinedIcon sx={{ ...styles.quickActionIcon, ...styles.quickActionDocumentIcon }} />
                                    </Box>

                                    <Typography sx={styles.quickActionText}>
                                        Send Document
                                    </Typography>
                                </Button>

                                <Button
                                    fullWidth
                                    disableRipple
                                    onClick={() => navigate("/health-and-safety/send-out/safety-alert")}
                                    sx={styles.quickActionButton}
                                >
                                    <Box sx={{ ...styles.quickActionIconWrapper, ...styles.quickActionHazardIconWrapper }}>
                                        <WarningAmberRoundedIcon sx={{ ...styles.quickActionIcon, ...styles.quickActionHazardIcon }} />
                                    </Box>

                                    <Typography sx={styles.quickActionText}>
                                        Safety Alert
                                    </Typography>
                                </Button>

                                <Button
                                    fullWidth
                                    disableRipple
                                    onClick={() => navigate("calendar/pending-requests")}
                                    sx={styles.quickActionButton}
                                >
                                    <Box sx={{ ...styles.quickActionIconWrapper, ...styles.quickActionLeaveIconWrapper }}>
                                        <CalendarTodayOutlinedIcon sx={{ ...styles.quickActionIcon, ...styles.quickActionLeaveIcon }} />
                                    </Box>

                                    <Typography sx={styles.quickActionText}>
                                        Review Leaves
                                    </Typography>
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                )}

                {recentActivityData !== null && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">
                            Recent Activity
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                            {recentActivityData.map((item, index) => (
                                <Box key={`${item.type}-${item.created}-${index}`} sx={{ mb: 1.5 }}>
                                    <Typography>
                                        {item.message}
                                    </Typography>
                                    <Typography variant="body2">
                                        {item.type} - {item.created}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
