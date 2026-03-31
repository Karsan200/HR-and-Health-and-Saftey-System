import { personalPageStyles as styles } from "./PersonalPage.styles";
import { Box, Button, Container } from "@mui/material";

export function PersonalPage() {

    return (
        <Box sx={styles.centreContainer}>
            <Container maxWidth="sm" sx={styles.container}>
                <Button sx={styles.buttonContainer} fullWidth size="large" variant="contained"> Profile Details </Button>
                <Button sx={styles.buttonContainer} fullWidth size="large" variant="contained"> Settings </Button>
                <Button sx={styles.buttonContainer} fullWidth size="large" variant="contained"> Security </Button>
            </Container>
        </Box>
    )
}