import type { ElementType } from "react";
import BeachAccessOutlined   from "@mui/icons-material/BeachAccessOutlined";
import SickOutlined           from "@mui/icons-material/SickOutlined";
import SchoolOutlined         from "@mui/icons-material/SchoolOutlined";
import ChildCareOutlined      from "@mui/icons-material/ChildCareOutlined";
import CalendarMonthOutlined  from "@mui/icons-material/CalendarMonthOutlined";
import MoneyOffOutlined       from "@mui/icons-material/MoneyOffOutlined";
import PriorityHighOutlined   from "@mui/icons-material/PriorityHighOutlined";
import WorkOffOutlined        from "@mui/icons-material/WorkOffOutlined";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import FavoriteOutlined       from "@mui/icons-material/FavoriteOutlined";
import MilitaryTechOutlined   from "@mui/icons-material/MilitaryTechOutlined";
import type { AuthenticationService } from "./AuthenticationService";

/** Shape returned by GET /api/leave/types */
export interface LeaveTypeResponse {
    leaveTypeId: number;
    name: string;
    colourIcon: string;
    colourBg: string;
    iconType: string;
}

/**
 * Resolved leave type with the MUI icon component already looked up.
 * This is what the rest of the frontend consumes.
 */
export interface ResolvedLeaveType {
    leaveTypeId: number;
    name: string;
    /** Background colour of the chip/tag, as a hex string (without #) */
    colourBg: string;
    /** Icon circle / text colour, as a hex string (without #) */
    colourIcon: string;
    /** MUI icon component ready to render as JSX */
    Icon: ElementType;
}

/**
 * Maps normalised iconType strings from the database to MUI icon components.
 * Normalisation strips all non-alpha characters and lowercases, so
 * "beach_access", "BeachAccess", and "BEACH_ACCESS" all resolve to the same key.
 * Add a new entry here whenever a new iconType value is introduced in the database.
 */
const ICON_REGISTRY: Record<string, ElementType> = {
    beachaccess:        BeachAccessOutlined,
    sick:               SickOutlined,
    school:             SchoolOutlined,
    childcare:          ChildCareOutlined,
    moneyoff:           MoneyOffOutlined,
    priorityhigh:       PriorityHighOutlined,
    workoff:            WorkOffOutlined,
    eventavailable:     EventAvailableOutlined,
    favorite:           FavoriteOutlined,
    militarytech:       MilitaryTechOutlined,
    calendarmonth:      CalendarMonthOutlined,
};

/** Fallback icon used when the database contains an unrecognised iconType string */
const FALLBACK_ICON: ElementType = CalendarMonthOutlined;

/**
 * Resolves an iconType string from the database into an MUI icon component.
 * Strips all non-alpha characters and lowercases before lookup so the format
 * stored in the database ("beach_access", "BeachAccess", etc.) does not matter.
 */
function resolveIcon(iconType: string): ElementType {
    const normalised = iconType.replace(/[^a-zA-Z]/g, "").toLowerCase();
    return ICON_REGISTRY[normalised] ?? FALLBACK_ICON;
}

/**
 * Fetches all leave types from the backend and resolves each iconType string
 * into a real MUI icon component.
 */
export async function fetchLeaveTypes(
    authService: AuthenticationService,
): Promise<ResolvedLeaveType[]> {
    const response = await authService.fetch("/api/leave/types", {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const body = await response.text();
        console.error(`Leave types fetch failed — status: ${response.status}, body: ${body}`);
        throw new Error(`Failed to fetch leave types: ${response.status}`);
    }

    const data: LeaveTypeResponse[] = await response.json();

    return data.map((lt) => ({
        leaveTypeId: lt.leaveTypeId,
        name:        lt.name,
        colourBg:    lt.colourBg,
        colourIcon:  lt.colourIcon,
        Icon:        resolveIcon(lt.iconType),
    }));
}

/**
 * Finds a resolved leave type by its display name.
 * Used by the pending requests page where the backend returns a name string.
 */
export function findLeaveTypeByName(
    leaveTypes: ResolvedLeaveType[],
    name: string,
): ResolvedLeaveType | undefined {
    return leaveTypes.find(
        (lt) => lt.name.toLowerCase() === name.toLowerCase(),
    );
}

/**
 * Formats a hex colour code from the database (stored without #) into a valid
 * CSS colour string.
 */
export function toHex(colourCode: string): string {
    return colourCode.startsWith("#") ? colourCode : `#${colourCode}`;
}