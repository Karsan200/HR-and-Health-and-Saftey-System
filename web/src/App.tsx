import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material";

import { muiTheme } from "./theme/muiTheme.ts";
import { IncompatibleScreen } from "./components/IncompatibleScreen.tsx";
import {AuthProvider} from "./AuthContext.tsx";

function App() {
    const [screenSize, setScreenSize] = useState(window.innerWidth);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
          {screenSize < 768 ? <IncompatibleScreen /> :
              <AuthProvider isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
                  <AppContent />
              </AuthProvider>
          }
      </ThemeProvider>
  )
}

function AppContent() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<></>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
