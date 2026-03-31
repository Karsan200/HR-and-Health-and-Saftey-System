import { AppBar, Box, Button, Toolbar } from "@mui/material";
import logo from "../assets/images/Rent-a-Tech-Logo.png";

export function Navbar() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                    <img src={logo} alt="Rent-A-Tech" height={40} />
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button color="inherit">Overview</Button>
                    <Button color="inherit">Calendar</Button>
                    <Button color="inherit">Employees</Button>
                    <Button color="inherit">Health & Safety</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
