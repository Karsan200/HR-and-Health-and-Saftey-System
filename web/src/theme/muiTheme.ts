import { createTheme } from '@mui/material/styles';
import {DefaultColours} from "./colours";

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