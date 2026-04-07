import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    CircularProgress,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import ShieldIcon from "@mui/icons-material/Shield";
import { personalPageStyles as styles } from "./PersonalPage.styles";
import { useAuth } from "../AuthContext";
import { fetchPersonalData, type ProfileResponse, type SettingsResponse } from "../logic/PersonalService";

type Tab = "profile" | "settings" | "security";

const TABS: { key: Tab; label: string }[] = [
    { key: "profile",   label: "Profile Information" },
    { key: "settings",  label: "Settings" },
    { key: "security",  label: "Security" },
];

// Settup for the rows of information

interface InfoRowProps {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string;
}

function InfoRow({ icon, iconBg, label, value }: InfoRowProps) {
    return (
        <Box sx={styles.infoRow}>
            <Box sx={styles.iconWrap(iconBg)}>
                {icon}
            </Box>
            <Box>
                <Typography sx={styles.infoLabel}>{label}</Typography>
                <Typography sx={styles.infoValue}>{value}</Typography>
            </Box>
        </Box>
    );
}

// First Tab of Personal Page (Profile)

function ProfileTab({ profile, settings }: { profile: ProfileResponse, settings: SettingsResponse }) {
    const hasSilentMode = settings.silentStart && settings.silentEnd;

    return (
        <>
            <Box sx={styles.sectionCard}>
                <Typography sx={styles.sectionTitle}>Personal Details</Typography>
                <InfoRow
                    icon={<EmailIcon sx={{ fontSize: 16, color: "#AE010B" }} />}
                    iconBg="#F6CDD0"
                    label="Email"
                    value={"​"+profile.email}
                />
                <InfoRow
                    icon={<PhoneIcon sx={{ fontSize: 16, color: "#AE010B" }} />}
                    iconBg="#F6CDD0"
                    label="Phone"
                    value={profile.phoneNumber}
                />
            </Box>

            <Box sx={styles.sectionCard}>
                <Typography sx={styles.sectionTitle}>Employee Details</Typography>
                <InfoRow
                    icon={<PersonOutlineIcon sx={{ fontSize: 16, color: "#0D7B42" }} />}
                    iconBg="#D0EDDE"
                    label="Name"
                    value={profile.firstName+" ​"+profile.lastName}
                />
                <InfoRow
                    icon={<CalendarTodayIcon sx={{ fontSize: 16, color: "#0D7B42" }} />}
                    iconBg="#D0EDDE"
                    label="Join Date"
                    value={profile.created}
                />
            </Box>

            {hasSilentMode && (
                <Box sx={styles.sectionCard}>
                    <Typography sx={styles.sectionTitle}>Notifications</Typography>
                    <Box sx={styles.infoRow}>
                        <Box sx={styles.iconWrap("#FFECCD")}>
                            <NotificationsOffIcon sx={{ fontSize: 16, color: "#E8960A" }} />
                        </Box>
                        <Typography sx={styles.notifText}>
                            Notifications silenced between {settings.silentStart} and {settings.silentEnd}
                        </Typography>
                    </Box>
                </Box>
            )}
        </>
    );
}

// Second Tab (Settings)
// TODO: Complete the Settings Tab

function SettingsTab({ label }: { label: string }) {
    return (
        <Box sx={{ ...styles.sectionCard, textAlign: "center", padding: "3rem" }}>
            <Typography sx={styles.infoLabel}>{label} TBC </Typography>
        </Box>
    );
}

// Third Tab (Security)
// TODO: Complete the Security Tab

function SecurityTab({ label }: { label: string }) {
    return (
        <Box sx={{ ...styles.sectionCard, textAlign: "center", padding: "3rem"}}>
            <Typography sx={styles.infoLabel}>{label} TBC </Typography>
        </Box>
    );
}

export function PersonalPage() {
    const { authenticationService } = useAuth();

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [settings, setSettings] = useState<SettingsResponse | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { profile, settings } = await fetchPersonalData(authenticationService);
            setProfile(profile);
            setSettings(settings);
        } catch {
            setError("Failed to load profile. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [authenticationService]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return (
        <Box sx={styles.pageContainer}>

            {profile && (
                <Box sx={styles.headerCard}>
                    <Box sx={styles.avatarCircle}>
                        <PersonOutlineIcon sx={{ fontSize: 28, color: "white" }} />
                    </Box>
                    <Box sx={styles.headerInfo}>
                        <Typography sx={styles.headerName}>
                            {profile.firstName} {profile.lastName}
                        </Typography>
                        <Typography sx={styles.headerEmail}>{profile.email}</Typography>
                    </Box>
                    <Box sx={styles.adminBadge}>
                        <ShieldIcon sx={{ fontSize: 24 }} />
                    </Box>
                </Box>
            )}

            {/* Tabs */}
            <Box sx={styles.tabsRow}>
                {TABS.map(({ key, label }) => (
                    <Box
                        key={key}
                        sx={styles.tab(activeTab === key)}
                        onClick={() => setActiveTab(key)}
                    >
                        {label}
                    </Box>
                ))}
            </Box>

            {/* Content */}
            {loading && (
                <Box sx={styles.loadingContainer}>
                    <CircularProgress size={32} sx={{ color: "#D20414" }} />
                </Box>
            )}

            {!loading && error && (
                <Typography sx={styles.errorText}>{error}</Typography>
            )}

            {!loading && !error && profile && settings && (
                <>
                    {activeTab === "profile"  && <ProfileTab profile={profile} settings={settings} />}
                    {activeTab === "settings" && <SettingsTab label="Settings" />}
                    {activeTab === "security" && <SecurityTab label="Security" />}
                </>
            )}
        </Box>
    );
}