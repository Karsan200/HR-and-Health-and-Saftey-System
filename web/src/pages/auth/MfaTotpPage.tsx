import {loginPageStyles as styles} from "./LoginPage.styles.ts";
import {Alert, Box, Container} from "@mui/material";
import {useState} from "react";
import {useAuth} from "../../AuthContext.tsx";

export function MfaTotpPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const auth = useAuth();

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
            </Container>
        </Box>
    )
}