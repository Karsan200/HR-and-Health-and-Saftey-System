import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import * as React from "react";
import { ActivityLoader } from "./components/ActivityLoader.tsx";
import {LoginPage} from "./pages/auth/LoginPage.tsx";
import {AuthenticationService} from "./logic/AuthenticationService.ts";
import {MfaQrCodePage} from "./pages/auth/MfaQrCodePage.tsx";
import {AppSettings} from "./AppSettings.ts";
import {MfaTotpPage} from "./pages/auth/MfaTotpPage.tsx";

export type AuthContextType = {
    authenticationService: AuthenticationService;

    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;

    isAuthenticated: boolean | null;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
    isMfaAuthenticated: boolean | null;
    setIsMfaAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
    isAuthenticated: boolean | null;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
    isMfaAuthenticated: boolean | null;
    setIsMfaAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}

export function AuthProvider(
    { children, isAuthenticated, setIsAuthenticated, isMfaAuthenticated, setIsMfaAuthenticated }: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [mfaSecret, setMfaSecret] = useState<string | null>(null);

    const authenticationService = new AuthenticationService(
        { accessToken, setAccessToken, isAuthenticated, setIsAuthenticated, isMfaAuthenticated, setIsMfaAuthenticated }
    );

    // On mount, try to refresh the token to check if the user is authenticated
    useEffect(() => {
        async function init() {
            try {
                await authenticationService.refresh();
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
            }
        }
        init();
    }, []);

    // When the authentication state changes, check if the user is authenticated and if they have MFA enabled
    useEffect(() => {
        if (!isAuthenticated) return;

        async function loadAuth() {
            const response = await authenticationService.fetch("/auth/mfa/check", { method: "GET" });

            if (response.ok) {
                const data = await response.json();
                setIsMfaAuthenticated(data.mfaAuthorised);
                if (data.secret !== null) {
                    setMfaSecret(
                    `otpauth://totp/${AppSettings.COMPANY_NAME}:${data.username}?secret=${data.secret}&issuer=${AppSettings.COMPANY_NAME}`
                    );
                }
            } else {
                setIsMfaAuthenticated(false);
            }
        }

        loadAuth();
    }, [isAuthenticated]);

    return (
        <AuthContext.Provider value={
        { authenticationService, accessToken, setAccessToken, isAuthenticated, setIsAuthenticated, isMfaAuthenticated, setIsMfaAuthenticated }
        }>
            {isAuthenticated === null ? <ActivityLoader /> :
            isAuthenticated ?
                mfaSecret === null ? isMfaAuthenticated ? children: <MfaTotpPage />
                : <MfaQrCodePage secret={mfaSecret} onComplete={() => setMfaSecret(null)}/>
            : <LoginPage />}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside an AuthProvider");
    return context;
}
