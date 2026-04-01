import * as React from "react";

export type AuthType = {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;

    isAuthenticated: boolean | null;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
    isMfaAuthenticated: boolean | null;
    setIsMfaAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}