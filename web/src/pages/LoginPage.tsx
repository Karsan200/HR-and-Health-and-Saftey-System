import { useState } from "react";
import { Box, Button, Container, TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { loginPageStyles as styles } from "./LoginPage.styles.ts";

export function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    return (
        <Box sx={styles.centreContainer}>
            <Container maxWidth="sm" sx={styles.container}>
                <Box sx={styles.imgContainer}>
                    <img src="/assets/images/Rent-a-Tech-Logo.png" alt="Rent-A-Tech" height={90} />
                </Box>
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
                <Button sx={styles.buttonContainer} fullWidth size="large" variant="contained">Login</Button>
            </Container>
        </Box>
    )
}