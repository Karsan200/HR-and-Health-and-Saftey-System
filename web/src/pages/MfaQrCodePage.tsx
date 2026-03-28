import QRCode from "react-qr-code";
import {loginPageStyles as styles} from "./LoginPage.styles.ts";
import { Box, Container } from "@mui/material";

export function MfaQrCodePage({secret}: {secret: string | null}) {
    if (!secret) {
        return null;
    }

    return (
        <Box sx={styles.centreContainer}>
            <Container maxWidth="sm" sx={styles.container}>
                <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={secret}
                    viewBox={`0 0 256 256`}
                />
            </Container>
        </Box>
    )
}