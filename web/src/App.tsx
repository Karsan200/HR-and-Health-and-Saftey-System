import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@mui/material";

import { muiTheme } from "./theme/muiTheme.ts";

function App() {

  return (
      <ThemeProvider theme={muiTheme}>
        <AppContent />
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
