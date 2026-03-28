import {createContext, type ReactNode, useContext, useEffect, useState} from "react";
import * as React from "react";
import { ActivityLoader } from "./components/ActivityLoader.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";

export type AuthContextType = {
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

    useEffect(() => {
        setIsAuthenticated(false)
    }, []);

    return (
        <AuthContext.Provider value={
        { accessToken, setAccessToken, isAuthenticated, setIsAuthenticated, isMfaAuthenticated, setIsMfaAuthenticated }
        }>
            {isAuthenticated === null ? <ActivityLoader /> : isAuthenticated ? children : <LoginPage />}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside an AuthProvider");
    return context;
}
