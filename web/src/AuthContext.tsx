import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import * as React from "react";
import { ActivityLoader } from "./components/ActivityLoader.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import {AuthenticationService} from "./logic/AuthenticationService.ts";
import {MfaQrCodePage} from "./pages/MfaQrCodePage.tsx";

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

    useEffect(() => {
        async function loadAuth() {
            // Refresh the token on initial load
            try {
                await authenticationService.refresh()
                setIsAuthenticated(true)
            } catch {
                setIsAuthenticated(false)
            }

            // Check if the user is MFA authenticated
            const response = await authenticationService.fetch("/auth/mfa/check", { method: "GET" });

            if (response.ok) {
                const data = await response.json();
                setIsMfaAuthenticated(data.isMfaAuthenticated);
                setMfaSecret(data.secret);
            }
            else {
                setIsMfaAuthenticated(false);
            }
        }
        loadAuth();
    }, []);

    return (
        <AuthContext.Provider value={
        { authenticationService, accessToken, setAccessToken, isAuthenticated, setIsAuthenticated, isMfaAuthenticated, setIsMfaAuthenticated }
        }>
            {isAuthenticated === null ? <ActivityLoader /> :
            isAuthenticated ?
                mfaSecret === null ? <MfaQrCodePage secret={mfaSecret} /> : children
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
