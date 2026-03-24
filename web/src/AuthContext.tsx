import {createContext, type ReactNode, useContext, useState} from "react";
import * as React from "react";
import {ActivityLoader} from "./components/ActivityLoader.tsx";

export type AuthContextType = {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;

    isAuthenticated: boolean | null;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
    isAuthenticated: boolean | null;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}

export function AuthProvider({ children, isAuthenticated, setIsAuthenticated }: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState<string | null>(null);

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, isAuthenticated, setIsAuthenticated }}>
            {isAuthenticated === null ? <ActivityLoader /> : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside an AuthProvider");
    return context;
}
