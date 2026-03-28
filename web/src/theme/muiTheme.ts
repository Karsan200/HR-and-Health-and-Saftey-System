import { createTheme } from '@mui/material/styles';
import {DefaultColours} from "./colours.ts";

export const muiTheme = createTheme({
    palette: {
        primary: {
            main: DefaultColours.redPrimary,
        },
        error: {
            main: DefaultColours.redBackgroundLight
        }
    }
});