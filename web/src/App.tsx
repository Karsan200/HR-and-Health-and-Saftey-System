import { useEffect, useState } from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {CssBaseline, ThemeProvider} from "@mui/material";

import { muiTheme } from "./theme/muiTheme";
import { IncompatibleScreen } from "./components/IncompatibleScreen";
import { AuthProvider } from "./AuthContext";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { CalendarPage } from "./pages/CalendarPage";
import { PendingRequestsPage } from "./pages/PendingRequestsPage";
import { PersonalPage } from "./pages/PersonalPage";
import { EmployeeOverview } from "./pages/EmployeeOverview";
import { SendOutDocumentsPage} from "./pages/SendOutDocumentsPage";
import { NotificationPage } from "./pages/NotificationPage";

function App() {
    const [screenSize, setScreenSize] = useState(window.innerWidth);

    // Authentication states
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isMfaAuthenticated, setIsMfaAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setScreenSize(window.innerWidth);
            if (window.innerWidth < 768) {
                setIsAuthenticated(null);
                setIsMfaAuthenticated(null);
            }
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
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/personal" element={<PersonalPage />} />
                    <Route path="/employee-overview" element={<></>} />
                    <Route path="/employee/overview" element={<EmployeeOverview />} />
                    <Route path="/health-and-safety" element={<></>} />
                    <Route path="/notifications" element={<NotificationPage/>} />
                    <Route path="/health-and-safety/send-out/safety-alert" element={<></>} />
                    <Route path="calendar/requests" element={<PendingRequestsPage />} />
                    <Route path="/health-and-safety/send-out" element={<SendOutDocumentsPage />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
