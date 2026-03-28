import { Alert, Box } from "@mui/material";
import AlertTitle from '@mui/material/AlertTitle';

import NoCellIcon from '@mui/icons-material/NoCell';

import { IncompatibleScreenStyles as styles } from "./IncompatibleScreen.styles.ts";

export function IncompatibleScreen() {
    return (
        <Box sx={styles.container}>
            <Alert variant="filled" icon={false} severity="error" sx={styles.alert}>
                <NoCellIcon sx={styles.icon} />
                <AlertTitle sx={styles.alert_title}>Incompatible Device!</AlertTitle>
                Sorry, it looks like your device is not compatible with this application. Please try accessing it on a desktop computer.
            </Alert>
        </Box>
    );
}