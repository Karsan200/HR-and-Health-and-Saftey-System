import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    CircularProgress,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import ShieldIcon from "@mui/icons-material/Shield";
import { personalPageStyles as styles } from "./PersonalPage.styles";
import { useAuth } from "../AuthContext";
import { fetchPersonalData, type ProfileResponse, type SettingsResponse } from "../logic/PersonalService";
import { changePassword } from "../logic/PersonalSecurityService";

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
                    icon={<EmailIcon sx={styles.redIcon} />}
                    iconBg={styles.iconColours.red.icon}
                    label="Email"
                    value={"​"+profile.email}
                />
                <InfoRow
                    icon={<PhoneIcon sx={styles.redIcon} />}
                    iconBg={styles.iconColours.red.icon}
                    label="Phone"
                    value={profile.phoneNumber}
                />
            </Box>

            <Box sx={styles.sectionCard}>
                <Typography sx={styles.sectionTitle}>Employee Details</Typography>
                <InfoRow
                    icon={<PersonOutlineIcon sx={styles.greenIcon} />}
                    iconBg={styles.iconColours.green.icon}
                    label="Name"
                    value={profile.firstName+" ​"+profile.lastName}
                />
                <InfoRow
                    icon={<CalendarTodayIcon sx={styles.greenIcon} />}
                    iconBg={styles.iconColours.green.icon}
                    label="Join Date"
                    value={profile.created}
                />
            </Box>

            {hasSilentMode && (
                <Box sx={styles.sectionCard}>
                    <Typography sx={styles.sectionTitle}>Notifications</Typography>
                    <Box sx={styles.infoRow}>
                        <Box sx={styles.iconWrap(styles.iconColours.amber.icon)}>
                            <NotificationsOffIcon sx={styles.amberIcon} />
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
        <Box sx={{ ...styles.sectionCard, ...styles.placeHolderCard }}>
            <Typography sx={styles.infoLabel}>{label} TBC </Typography>
        </Box>
    );
}

// Third Tab (Security)

function SecurityTab() {
    const { authenticationService } = useAuth();

    const [currentPassword, setCurrentPassword]     = useState("");
    const [newPassword, setNewPassword]             = useState("");
    const [confirmNewPassword, setConfirmPassword]  = useState("");
    const [submitting, setSubmitting]               = useState(false);
    const [success, setSuccess]                     = useState(false);
    const [error, setError]                         = useState<string | null>(null);

    async function handleSubmit() {
        setError(null);
        setSuccess(false);

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword == currentPassword) {
            setError("New password must be different to old password.")
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setSubmitting(true);
        try {
            await changePassword(authenticationService, {
                oldPassword: currentPassword,
                newPassword,
                confirmNewPassword,
            });
            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            setError("Failed to change password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Box sx={styles.securityCard}>
            <Typography sx={styles.securityTitle}>Change Password</Typography>

            <Box
                component="input"
                type="password"
                placeholder="Password"
                value={currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCurrentPassword(e.target.value)
                }
                sx={styles.securityInput}
            />

            <Box
                component="input"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewPassword(e.target.value)
                }
                sx={styles.securityInput}
            />

            <Box
                component="input"
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                }
                sx={styles.securityInput}
            />

            <Box sx={styles.securityButtonRow}>
                <Box
                    component="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    sx={styles.securityButton}
                >
                    <LockOutlinedIcon sx={{ fontSize: 16 }} />
                    {submitting ? "Changing..." : "Submit Change"}
                </Box>
            </Box>

            {success && (
                <Typography sx={styles.securitySuccessText}>
                    Password changed successfully.
                </Typography>
            )}

            {error && (
                <Typography sx={styles.securityErrorText}>
                    {error}
                </Typography>
            )}
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
                        <PersonOutlineIcon sx={styles.avatarIcon} />
                    </Box>
                    <Box sx={styles.headerInfo}>
                        <Typography sx={styles.headerName}>
                            {profile.firstName} {profile.lastName}
                        </Typography>
                        <Typography sx={styles.headerEmail}>{profile.email}</Typography>
                    </Box>
                    <Box sx={styles.adminBadge}>
                        <ShieldIcon sx={styles.adminBadgeIcon} />
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
                    <CircularProgress size={32} sx={styles.loadingSpinner} />
                </Box>
            )}

            {!loading && error && (
                <Typography sx={styles.errorText}>{error}</Typography>
            )}

            {!loading && !error && profile && settings && (
                <>
                    {activeTab === "profile"  && <ProfileTab profile={profile} settings={settings} />}
                    {activeTab === "settings" && <SettingsTab label="Settings" />}
                    {activeTab === "security" && <SecurityTab/>}
                </>
            )}
        </Box>
    );
}