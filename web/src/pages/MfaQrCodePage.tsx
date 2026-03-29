import {loginPageStyles as styles} from "./LoginPage.styles.ts";
import {Box, Container, Typography} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import {DefaultColours} from "../theme/colours.ts";

export function MfaQrCodePage({secret}: {secret: string | null}) {
    console.log(secret)

    return (
        <Box sx={styles.centreContainer}>
            <Container maxWidth="sm" sx={styles.container}>
                <Typography variant={"h4"} color={DefaultColours.greyPrimaryMainText}>
                    Set up Multi-Factor Authentication
                </Typography>
                <Container sx={styles.qrcodeContainer}>
                    <QRCodeSVG value={secret ?? "null"} size={256} />
                </Container>
            </Container>
        </Box>
    )
}