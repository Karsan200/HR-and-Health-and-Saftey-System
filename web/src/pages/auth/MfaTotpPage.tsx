import {loginPageStyles as styles} from "./LoginPage.styles";
import {Alert, Box, Button, Container, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {useAuth} from "../../AuthContext";
import {HttpException} from "../../models/HttpException";
import {AuthenticationService} from "../../logic/AuthenticationService";

export function MfaTotpPage() {
    const [totpCode, setTotpCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const auth = useAuth();

    // Check the cookie for the MFA secret
    const cookie = AuthenticationService.extractMfaCookie()

    // Countdown to return to TOTP setup
    const [count, setCount] = useState(cookie !== null ? 60 : -1);

    useEffect(() => {
        if (count == -1) return;

        // Remove the cookie when the countdown reaches 0
        if (count == 0) {
            document.cookie = `mfaSecret=; path=/; samesite=strict; max-age=0`;
            setCount(count - 1);
        }

        const interval = setInterval(() => {
            setCount(count - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [count]);

    async function handleTotp() {
        // check if totp code is 6 digits
        if (!/^\d{6}$/.test(totpCode)) {
            setError("Please enter a valid 6-digit code.");
            return;
        }

        setLoading(true);

        try {
            await auth.authenticationService.mfaTotp(totpCode);
        }
        catch (e) {
            if (e instanceof HttpException) {
                switch (e.statusCode) {
                    case 403:
                        setError("Invalid or expired TOTP code. Please try again.");
                        break;
                    default:
                        setError("An error occurred while trying to verify the MFA code. Please try again later.");
                }
            }
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <Box sx={styles.centreContainer}>
            <Container maxWidth="sm" sx={styles.container}>
                <Box sx={styles.imgContainer}>
                    <img src="/assets/images/Rent-a-Tech-Logo.png" alt="Rent-A-Tech" height={90} />
                </Box>
                {error !== null && (
                    <Alert variant="filled" severity="error">
                        {error}
                    </Alert>
                )}
                <TextField
                    required fullWidth margin="normal" label="MFA Code" id="Totp"
                    value={totpCode} onChange={(e) => setTotpCode(e.target.value)}
                    helperText="Please enter the 6-digit code from your authenticator app"
                />
                <Button sx={styles.buttonContainer} fullWidth size="large" variant="contained"
                        loading={loading} onClick={() => handleTotp()}>
                    Verify
                </Button>
                {count > 0 && (
                    <Button sx={styles.buttonContainer} fullWidth size="large" variant="outlined"
                            loading={loading} onClick={() => auth.setMfaSecret(cookie)}>
                        ← Back to MFA setup ({count})
                    </Button>
                )}
            </Container>
        </Box>
    )
}