import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";

type ProfileData = {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phone: string;
    position: string;
    joinDate: string;
    silentStart: string;
    silentEnd: string;
    isAdmin: boolean;
};

type Tab = "profile" | "settings" | "security";

export function PersonalPage() {
    const { authenticationService } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    useEffect(() => {
        async function load() {
            const response = await authenticationService.fetch("/api/profile/me", { method: "GET" });
            if (response.ok) {
                setProfile(await response.json());
            }
        }
        load();
    }, [authenticationService]);

    if (!profile) return null;

    return (
        <div className="page">
            {/* Header */}
            <div className="header-card">
                <div className="avatar">...</div>
                <div className="header-info">
                    <div className="header-name">{profile.firstName} {profile.lastName}</div>
                    <div className="header-role">{profile.role}</div>
                </div>
                {profile.isAdmin && <div className="admin-badge">Admin Access</div>}
            </div>

            {/* Tabs */}
            <div className="tabs">
                {(["profile", "settings", "security"] as Tab[]).map(tab => (
                    <div
                        key={tab}
                        className={`tab ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </div>
                ))}
            </div>

            {/* Content */}
            {activeTab === "profile" && <ProfileTab profile={profile} />}
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "security" && <SecurityTab />}
        </div>
    );
}