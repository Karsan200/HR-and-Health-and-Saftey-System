import { useEffect, useState } from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {CssBaseline, ThemeProvider} from "@mui/material";

import { muiTheme } from "./theme/muiTheme";
import { IncompatibleScreen } from "./components/IncompatibleScreen";
import { AuthProvider } from "./AuthContext";

function App() {
    const [screenSize, setScreenSize] = useState(window.innerWidth);

    // Authentication states
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isMfaAuthenticated, setIsMfaAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setScreenSize(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            {screenSize < 768 ? <IncompatibleScreen/> :
                <AuthProvider isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}
                    isMfaAuthenticated={isMfaAuthenticated} setIsMfaAuthenticated={setIsMfaAuthenticated}
                >
                  <AppContent />
              </AuthProvider>
          }
      </ThemeProvider>
  )
}

function AppContent() {
    return (
        <>
        {/** Admin top navbar goes here */}
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<></>} />
            </Routes>
        </BrowserRouter>
        </>
    )
}

export default App
