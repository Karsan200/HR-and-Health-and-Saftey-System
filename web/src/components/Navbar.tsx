import { AppBar, Box, Button, Toolbar, IconButton } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { NavLink } from "react-router-dom";

import { navbarStyles as styles } from "./Navbar.styles";

// Defining the items to be displayed in the navbar, with their corresponding paths.
const navbarItems = [
    { label: "Overview", path: "/" },
    { label: "Calendar", path: "/calendar" },
    { label: "Employee Overview", path: "/employee/overview" },
    { label: "Health and Safety", path: "/documents/send-out" },
] as const;

export function Navbar() {
    return (
        <AppBar position="static" sx={styles.appBar}>
            <Toolbar sx={styles.toolbar}>
                {/* Displaying the rent-a-tech logo, or a text placeholder if the image was not recieved*/ }
                <Box sx={styles.logoContainer}>
                    <Box
                        component="img"
                        src="/assets/images/Rent-a-Tech-Logo.png"
                        alt="Rent-A-Tech"
                        sx={styles.logo}
                    />
                </Box>

                {/* Displaying the available pages as buttons on the central navigation in the navbar */}
                <Box sx={styles.navWrapper}>
                    <Box sx={styles.navContainer}>
                        {navbarItems.map((item) => (
                            <Button
                                key={item.path}
                                component={NavLink}
                                to={item.path}
                                end={item.path === "/"}
                                sx={styles.navButton}
                                disableRipple
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>
                </Box>

                {/* Displaying the notifications button, with a redirect for when the button is clicked*/}
                <Box sx={styles.actionsContainer}>
                    <Box sx={styles.notificationWrapper}>
                        <IconButton
                            component={NavLink}
                            to="/notifications"
                            aria-label="notifications"
                            sx={styles.iconButton}
                        >
                            <NotificationsIcon />
                        </IconButton>
                        <Box sx={styles.notificationDot} />
                    </Box>

                    {/* Displaying the profile button, with a redirect for when the button is clicked*/}
                    <IconButton
                        component={NavLink}
                        to="/personal"
                        aria-label="profile"
                        sx={styles.iconButton}
                    >
                        <AccountCircleIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
