import {
    BeachAccessOutlined,
    SickOutlined,
    EventAvailableOutlined,
    SchoolOutlined,
} from "@mui/icons-material";
import { DefaultColours } from "../theme/colours";

export type CalendarEventType = "nationalHoliday" | "sickLeave" | "bookedLeave" | "trainingLeave";

export interface CalendarEvent {
    id: string;
    date: string;
    type: CalendarEventType;
    label: string;
    notes?: string;
}

export function eventConfig(type: CalendarEventType): {
    chipBg: string;
    iconCircleBg: string;
    textColor: string;
    Icon: React.ElementType;
} {
    switch (type) {
        case "nationalHoliday":
            return {
                chipBg: DefaultColours.blueLight,
                iconCircleBg: DefaultColours.bluePrimary,
                textColor: DefaultColours.blueDark,
                Icon: BeachAccessOutlined,
            };
        case "sickLeave":
            return {
                chipBg: DefaultColours.redBackgroundLight,
                iconCircleBg: DefaultColours.redPrimary,
                textColor: DefaultColours.redTextDark,
                Icon: SickOutlined,
            };
        case "bookedLeave":
            return {
                chipBg: DefaultColours.amberBackgroundLight,
                iconCircleBg: DefaultColours.amberPrimary,
                textColor: DefaultColours.amberTextDark,
                Icon: EventAvailableOutlined,
            };
        case "trainingLeave":
            return {
                chipBg: DefaultColours.greenBackgroundLight,
                iconCircleBg: DefaultColours.greenPrimary,
                textColor: DefaultColours.greenTextDark,
                Icon: SchoolOutlined,
            };
    }
}