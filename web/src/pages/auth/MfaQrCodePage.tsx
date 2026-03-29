import {loginPageStyles as styles} from "./LoginPage.styles.ts";
import {Box, Container, Typography, Button, Collapse} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import {DefaultColours} from "../../theme/colours.ts";
import {useState} from "react";

export function MfaQrCodePage({ secret, onComplete }: { secret: string; onComplete: () => void }) {
    const [showSecret, setShowSecret] = useState(false);

    if (secret === null) {
        secret = "Failed to generate QR code. Please try again later.";
    }

    return (
        <Box sx={styles.centreContainer}>
            <Container maxWidth="sm" sx={styles.container}>
                <Typography variant={"h4"} color={DefaultColours.black}>
                    Set up Multi-Factor Authentication
                </Typography>
                <Container sx={styles.qrcodeContainer}>
                    <QRCodeSVG value={secret} size={256} />
                </Container>
                <Typography variant={"body1"} color={DefaultColours.black}>
                    Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy, Apple Keychain)
                </Typography>
                <Button variant="text" onClick={() => setShowSecret(v => !v)} sx={{ mt: 1 }}>
                    {showSecret ? "Hide secret" : "Can't scan? Show secret"}
                </Button>
                <Collapse in={showSecret}>
                    <Typography sx={styles.readableCodeText}>
                        {secret.split("secret=")[1].split("&issuer=")[0]}
                    </Typography>
                </Collapse>
                <hr />
                <Button variant="contained" onClick={onComplete}>
                    Continue
                </Button>
            </Container>
        </Box>
    )
}