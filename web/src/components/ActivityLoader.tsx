import { Box, CircularProgress } from "@mui/material";
import { IncompatibleScreenStyles as styles } from "./IncompatibleScreen.styles";

export function ActivityLoader() {
    return (
        <Box sx={styles.container}>
            <CircularProgress enableTrackSlot size="6rem" />
        </Box>
    )
}