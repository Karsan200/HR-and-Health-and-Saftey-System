import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useAuth } from "../AuthContext";
import { getDashboardSummary } from "../logic/DashboardService";

export function Dashboard() {
    const { authenticationService } = useAuth();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        getDashboardSummary(authenticationService).then((response) => {
            setData(response);
        });
    }, [authenticationService]);

    if (data === null) {
        return null;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography>Pending Signatures: {data.pendingSignatures}</Typography>
            <Typography>Late's This Week: {data.lateThisWeek}</Typography>
            <Typography>Open Hazards: {data.openHazards}</Typography>
        </Box>
    );
}
