import dayjs from 'dayjs';

export const daysInAdvance = 14;

export const monThurStartHour = 8;
export const monThurStartMin = 0;
export const monThurEndHour = 17;
export const monThurEndMin = 0;

export const friStartHour = 8;
export const friStartMin = 0;
export const friEndHour = 12;
export const friEndMin = 0;

export const fridayDayIndex = 5;
export const saturdayDayIndex = 6;
export const sundayDayIndex = 0;

export const getWorkingDayBounds = (date: Date) => {
    const dayIndex = dayjs(date).day();

    if (dayIndex === fridayDayIndex) {
        return {
            start: {
                hours: friStartHour,
                minutes: friStartMin,
            },
            end: {
                hours: friEndHour,
                minutes: friEndMin,
            },
        };
    }

    return {
        start: {
            hours: monThurStartHour,
            minutes: monThurStartMin,
        },
        end: {
            hours: monThurEndHour,
            minutes: monThurEndMin,
        },
    };
};

export const isWeekend = (date: Date) => {
    const dayIndex = dayjs(date).day();
    return dayIndex === saturdayDayIndex || dayIndex === sundayDayIndex;
};

export const toMinutes = (hours: number, minutes: number) => hours * 60 + minutes;

export const formatTime = (hours: number, minutes: number) => {
    return dayjs()
        .hour(hours)
        .minute(minutes)
        .second(0)
        .format('HH:mm');
};

/**
 * Validates the selected partial-day booking times.
 * Returns an empty string when valid, otherwise returns the validation message.
 */
export const validatePartialDayTimes = (
    startDate: Date | undefined,
    endDate: Date | undefined,
    startHours: number,
    startMinutes: number,
    endHours: number,
    endMinutes: number,
): string => {
    if (!startDate || !endDate) {
        return 'Please enter both the start and end date.';
    }

    if (!dayjs(startDate).isSame(dayjs(endDate), 'day')) {
        return 'Specific hours can only be booked for a single day.';
    }

    if (isWeekend(startDate)) {
        return 'Specific hours can only be booked on working days.';
    }

    const bounds = getWorkingDayBounds(startDate);

    const selectedStartMinutes = toMinutes(startHours, startMinutes);
    const selectedEndMinutes = toMinutes(endHours, endMinutes);
    const allowedStartMinutes = toMinutes(bounds.start.hours, bounds.start.minutes);
    const allowedEndMinutes = toMinutes(bounds.end.hours, bounds.end.minutes);

    if (
        selectedStartMinutes < allowedStartMinutes ||
        selectedStartMinutes >= allowedEndMinutes
    ) {
        return 'Start time must be within working hours.';
    }

    if (
        selectedEndMinutes <= allowedStartMinutes ||
        selectedEndMinutes > allowedEndMinutes
    ) {
        return 'End time must be within working hours.';
    }

    if (selectedEndMinutes <= selectedStartMinutes) {
        return 'End time must be later than the start time.';
    }

    return '';
};

/**
 * Builds the start and end dates in the format required by the backend.
 * Uses full-day values by default and date-time values for partial-day bookings.
 */
export const buildSubmissionDates = (
    startDate: Date | undefined,
    endDate: Date | undefined,
    isPartialDay: boolean,
    startHours: number,
    startMinutes: number,
    endHours: number,
    endMinutes: number,
) => {
    if (!startDate || !endDate) {
        return null;
    }

    if (!isPartialDay) {
        return {
            startDate: dayjs(startDate).format('YYYY-MM-DD'),
            endDate: dayjs(endDate).format('YYYY-MM-DD'),
        };
    }

    const partialStartDate = dayjs(startDate)
        .hour(startHours)
        .minute(startMinutes)
        .second(0);

    const partialEndDate = dayjs(endDate)
        .hour(endHours)
        .minute(endMinutes)
        .second(0);

    return {
        startDate: partialStartDate.format('YYYY-MM-DDTHH:mm:ss'),
        endDate: partialEndDate.format('YYYY-MM-DDTHH:mm:ss'),
    };
};

/**
 * Returns the working-hours helper text shown for partial-day bookings.
 */
export const getWorkingHoursText = (startDate: Date | undefined) => {
    return startDate && dayjs(startDate).day() === fridayDayIndex
        ? `Working hours for Friday are ${formatTime(friStartHour, friStartMin)} - ${formatTime(friEndHour, friEndMin)}.`
        : `Working hours are ${formatTime(monThurStartHour, monThurStartMin)} - ${formatTime(monThurEndHour, monThurEndMin)}.`;
};
