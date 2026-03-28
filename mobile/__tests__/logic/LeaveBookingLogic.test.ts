import {
  daysInAdvance,
  monThurStartHour,
  monThurStartMin,
  monThurEndHour,
  monThurEndMin,
  friStartHour,
  friStartMin,
  friEndHour,
  friEndMin,
  getWorkingDayBounds,
  isWeekend,
  toMinutes,
  formatTime,
  validatePartialDayTimes,
  buildSubmissionDates,
  getWorkingHoursText,
} from '../../src/logic/LeaveBookingLogic';

describe('LeaveBookingLogic', () => {
  it('getWorkingDayBounds - should return Friday working hours for a Friday', () => {
    // Given a Friday is selected
    const friday = new Date('2026-03-20T00:00:00');

    // When the working day bounds are requested
    const result = getWorkingDayBounds(friday);

    // Then the Friday working hours should be returned
    expect(result).toEqual({
      start: {
        hours: friStartHour,
        minutes: friStartMin,
      },
      end: {
        hours: friEndHour,
        minutes: friEndMin,
      },
    });
  });

  it('getWorkingDayBounds - should return Monday to Thursday working hours for a weekday', () => {
    // Given a Monday is selected
    const monday = new Date('2026-03-16T00:00:00');

    // When the working day bounds are requested
    const result = getWorkingDayBounds(monday);

    // Then the Monday to Thursday working hours should be returned
    expect(result).toEqual({
      start: {
        hours: monThurStartHour,
        minutes: monThurStartMin,
      },
      end: {
        hours: monThurEndHour,
        minutes: monThurEndMin,
      },
    });
  });

  it('isWeekend - should return true for Saturday', () => {
    // Given a Saturday is selected
    const saturday = new Date('2026-03-21T00:00:00');

    // When the weekend check is performed
    const result = isWeekend(saturday);

    // Then the date should be treated as a weekend
    expect(result).toBe(true);
  });

  it('isWeekend - should return true for Sunday', () => {
    // Given a Sunday date
    const sunday = new Date('2026-03-22T00:00:00');

    // When the weekend check is performed
    const result = isWeekend(sunday);

    // Then the date should be treated as a weekend
    expect(result).toBe(true);
  });

  it('isWeekend - should return false for a weekday', () => {
    // Given any weekday is selected
    const monday = new Date('2026-03-16T00:00:00');

    // When the weekend check is performed
    const result = isWeekend(monday);

    // Then the date should not be treated as a weekend
    expect(result).toBe(false);
  });

  it('toMinutes - should convert hours and minutes into total minutes', () => {
    // Given an hours and minutes pair
    const hours = 2;
    const minutes = 30;

    // When the values are converted to total minutes
    const result = toMinutes(hours, minutes);

    // Then the correct total minutes should be returned
    expect(result).toBe(150);
  });

  it('formatTime - should return time in HH:mm format', () => {
    // Given a valid time value
    const hours = 8;
    const minutes = 5;

    // When the time is formatted
    const result = formatTime(hours, minutes);

    // Then the formatted time should use two digit hours and minutes
    expect(result).toBe('08:05');
  });

  it('validatePartialDayTimes - should return error when start date is missing', () => {
    // Given no start date is provided
    const endDate = new Date('2026-03-16T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      undefined,
      endDate,
      8,
      0,
      10,
      0,
    );

    // Then the missing date validation message should be returned
    expect(result).toBe('Please enter both the start and end date.');
  });

  it('validatePartialDayTimes - should return error when end date is missing', () => {
    // Given no end date is provided
    const startDate = new Date('2026-03-16T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      startDate,
      undefined,
      8,
      0,
      10,
      0,
    );

    // Then the missing date validation message should be returned
    expect(result).toBe('Please enter both the start and end date.');
  });

  it('validatePartialDayTimes - should return error when dates are not on the same day', () => {
    // Given start and end dates on different calendar days
    const startDate = new Date('2026-03-16T00:00:00');
    const endDate = new Date('2026-03-17T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      startDate,
      endDate,
      8,
      0,
      10,
      0,
    );

    // Then the single day validation message should be returned
    expect(result).toBe('Specific hours can only be booked for a single day.');
  });

  it('validatePartialDayTimes - should return error when booking is on a weekend', () => {
    // Given a Saturday booking date
    const saturday = new Date('2026-03-21T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      saturday,
      saturday,
      8,
      0,
      10,
      0,
    );

    // Then the working day validation message should be returned
    expect(result).toBe('Specific hours can only be booked on working days.');
  });

  it('validatePartialDayTimes - should return error when start time is before allowed working hours', () => {
    // Given a weekday booking with a start time before the allowed working hours
    const monday = new Date('2026-03-16T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      monday,
      monday,
      7,
      59,
      10,
      0,
    );

    // Then the start time validation message should be returned
    expect(result).toBe('Start time must be within working hours.');
  });

  it('validatePartialDayTimes - should return error when start time is equal to end of working hours', () => {
    // Given a weekday booking with a start time equal to the end of working hours
    const monday = new Date('2026-03-16T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      monday,
      monday,
      17,
      0,
      17,
      0,
    );

    // Then the start time validation message should be returned
    expect(result).toBe('Start time must be within working hours.');
  });

  it('validatePartialDayTimes - should return error when end time is equal to start of working hours', () => {
    // Given a weekday booking with an end time equal to the start of working hours
    const monday = new Date('2026-03-16T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      monday,
      monday,
      8,
      0,
      8,
      0,
    );

    // Then the end time validation message should be returned
    expect(result).toBe('End time must be within working hours.');
  });

  it('validatePartialDayTimes - should return error when end time is after allowed working hours', () => {
    // Given a weekday booking with an end time after working hours
    const monday = new Date('2026-03-16T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      monday,
      monday,
      8,
      0,
      17,
      1,
    );

    // Then the end time validation message should be returned
    expect(result).toBe('End time must be within working hours.');
  });

  it('validatePartialDayTimes - should return error when end time is not later than start time', () => {
    // Given a weekday booking where the end time is before the start time
    const monday = new Date('2026-03-16T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      monday,
      monday,
      10,
      0,
      9,
      0,
    );

    // Then the ordering validation message should be returned
    expect(result).toBe('End time must be later than the start time.');
  });

  it('validatePartialDayTimes - should return empty string for a valid Monday to Thursday booking', () => {
    // Given a valid weekday partial-day booking within working hours
    const monday = new Date('2026-03-16T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      monday,
      monday,
      9,
      0,
      12,
      0,
    );

    // Then no validation error should be returned
    expect(result).toBe('');
  });

  it('validatePartialDayTimes - should return empty string for a valid Friday booking', () => {
    // Given a valid Friday partial-day booking within Friday working hours
    const friday = new Date('2026-03-20T00:00:00');

    // When partial day times are validated
    const result = validatePartialDayTimes(
      friday,
      friday,
      8,
      30,
      11,
      30,
    );

    // Then no validation error should be returned
    expect(result).toBe('');
  });

  it('buildSubmissionDates - should return null when start date is missing', () => {
    // Given an undefined start date
    const endDate = new Date('2026-03-16T00:00:00');

    // When submission dates are built
    const result = buildSubmissionDates(
      undefined,
      endDate,
      false,
      8,
      0,
      17,
      0,
    );

    // Then null should be returned
    expect(result).toBeNull();
  });

  it('buildSubmissionDates - should return null when end date is missing', () => {
    // Given an undefined end date
    const startDate = new Date('2026-03-16T00:00:00');

    // When submission dates are built
    const result = buildSubmissionDates(
      startDate,
      undefined,
      false,
      8,
      0,
      17,
      0,
    );

    // Then null should be returned
    expect(result).toBeNull();
  });

  it('buildSubmissionDates - should build full day submission dates for Monday to Thursday', () => {
    // Given a weekday full-day booking
    const startDate = new Date('2026-03-16T13:20:00');
    const endDate = new Date('2026-03-17T14:30:00');

    // When submission dates are built
    const result = buildSubmissionDates(
      startDate,
      endDate,
      false,
      9,
      0,
      15,
      0,
    );

    // Then the full working day start and end times should be used
    expect(result).toEqual({
      startDate: '2026-03-16T08:00:00',
      endDate: '2026-03-17T17:00:00',
    });
  });

  it('buildSubmissionDates - should build full day submission dates using Friday end time when end date is Friday', () => {
    // Given a full-day Friday booking
    const friday = new Date('2026-03-20T09:00:00');

    // When submission dates are built
    const result = buildSubmissionDates(
      friday,
      friday,
      false,
      9,
      0,
      10,
      0,
    );

    // Then the Friday working hours should be used
    expect(result).toEqual({
      startDate: '2026-03-20T08:00:00',
      endDate: '2026-03-20T12:00:00',
    });
  });

  it('buildSubmissionDates - should build partial day submission dates using the selected time values', () => {
    // Given a partial-day booking and selected custom hours
    const startDate = new Date('2026-03-16T00:00:00');
    const endDate = new Date('2026-03-16T00:00:00');

    // When submission dates are built
    const result = buildSubmissionDates(
      startDate,
      endDate,
      true,
      10,
      15,
      14,
      45,
    );

    // Then the selected partial-day times should be used
    expect(result).toEqual({
      startDate: '2026-03-16T10:15:00',
      endDate: '2026-03-16T14:45:00',
    });
  });

  it('getWorkingHoursText - should return Friday working hours text for a Friday', () => {
    // Given a Friday start date
    const friday = new Date('2026-03-20T00:00:00');

    // When the working hours helper text is requested
    const result = getWorkingHoursText(friday);

    // Then the Friday hours message should be returned
    expect(result).toBe('Working hours for Friday are 08:00 - 12:00.');
  });

  it('getWorkingHoursText - should return default weekday working hours text for a weekday', () => {
    // Given a weekday start date
    const monday = new Date('2026-03-16T00:00:00');

    // When the working hours helper text is requested
    const result = getWorkingHoursText(monday);

    // Then the weekday hours message should be returned
    expect(result).toBe('Working hours are 08:00 - 17:00.');
  });

  it('getWorkingHoursText - should return default weekday working hours text when start date is undefined', () => {
    // Given no start date has been selected
    // When the working hours helper text is requested
    const result = getWorkingHoursText(undefined);

    // Then the default weekday hours message should be returned
    expect(result).toBe('Working hours are 08:00 - 17:00.');
  });

  it('daysInAdvance - should expose the configured booking lead time', () => {
    expect(daysInAdvance).toBe(14);
  });
});
