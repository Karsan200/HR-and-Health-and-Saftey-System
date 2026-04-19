import type { ElementType } from "react";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import type { ResolvedLeaveType } from "../logic/LeaveTypeService";
import { toHex } from "../logic/LeaveTypeService";

export type CalendarEventType = string;

export interface CalendarEvent {
    id:         string;
    date:       string;
    type:       string;
    label:      string;
    notes?:     string;
    startTime?: string;
    endTime?:   string;
}

export interface EventVisualConfig {
    chipBg: string;
    iconCircleBg: string;
    textColor: string;
    Icon: ElementType;
}

const FALLBACK_CONFIG: EventVisualConfig = {
    chipBg:       "#F6F6F8",
    iconCircleBg: "#ABABB3",
    textColor:    "#767676",
    Icon:         CalendarMonthOutlined,
};

export function resolveEventConfig(leaveType: ResolvedLeaveType): EventVisualConfig {
    return {
        chipBg:       toHex(leaveType.colourBg),
        iconCircleBg: toHex(leaveType.colourIcon),
        textColor:    toHex(leaveType.colourIcon),
        Icon:         leaveType.Icon,
    };
}

export function eventConfigForType(
    type: CalendarEventType,
    leaveTypes: ResolvedLeaveType[],
): EventVisualConfig {
    const normalise = (s: string) => s.replace(/[\s_-]/g, "").toLowerCase();
    const match = leaveTypes.find((lt) => normalise(lt.name) === normalise(type));
    return match ? resolveEventConfig(match) : FALLBACK_CONFIG;
}