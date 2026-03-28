import { useState } from "react";
import { Box, Button, Container, TextField, InputAdornment, IconButton, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { loginPageStyles as styles } from "./LoginPage.styles.ts";
import { useAuth } from "../AuthContext.tsx";
import { AuthenticationService } from "../logic/AuthenticationService.ts";
import { HttpException } from "../models/HttpException.ts";

export function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const auth = useAuth();

    async function handleLogin() {
        // check if username and password are not empty
        if (username.trim() === '' || password.trim() === '') {
            setError("Please enter both username and password.");
            return;
        }

        try {
            await new AuthenticationService(auth).login(username, password);
        }
        catch (e) {
            if (e instanceof HttpException) {
                switch (e.statusCode) {
                    case 401:
                        setError("Invalid username or password.");
                        break;
                    case 404:
                        setError("No user exists with the provided username. Please check your username and try again.");
                        break;
                    default:
                        setError("An error occurred while trying to log in. Please try again later.");
                }
            }
        }
    }

    return (
        <Box sx={styles.centreContainer}>
            <Container maxWidth="sm" sx={styles.container}>
                <Box sx={styles.imgContainer}>
                    <img src="/assets/images/Rent-a-Tech-Logo.png" alt="Rent-A-Tech" height={90} />
                </Box>
                <div hidden={error === null}>
                    <Alert variant="filled" severity="error">
                        {error}
                    </Alert>
                </div>
                <TextField required fullWidth margin="normal" label="Username" id="username"
                value={username} onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    required fullWidth margin="normal" label="Password" id="password"
                    type={showPassword ? "text" : "password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
                <Button sx={styles.buttonContainer} fullWidth size="large" variant="contained"
                onClick={() => handleLogin()}>
                    Login
                </Button>
            </Container>
        </Box>
    )
}