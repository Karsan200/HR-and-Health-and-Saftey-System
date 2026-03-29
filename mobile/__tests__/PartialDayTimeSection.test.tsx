/**
 * @format
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PartialDayTimeSection from '../src/screens/PartialDayTimeSection';

describe('PartialDayTimeSection', () => {
  const styles = {
    fieldWrapper: {},
    partialDayToggleRow: {},
    partialDayToggleTextWrapper: {},
    fieldLabel: {},
    secondaryText: {},
    partialDayToggleIndicator: {},
    partialDayToggleIndicatorSelected: {},
    partialDayToggleIndicatorText: {},
    timeRow: {},
    timeButton: {},
    timeButtonLabel: {},
    timeButtonValue: {},
  };

  const formatTime = (hours: number, minutes: number) =>
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  it('does not render anything when the booking is not for a single day', () => {
    // Given the booking spans more than one day
    const { queryByText } = render(
      <PartialDayTimeSection
        isSingleDayBooking={false}
    isPartialDay={false}
    setIsPartialDay={jest.fn()}
    setIsStartTimePickerVisible={jest.fn()}
    setIsEndTimePickerVisible={jest.fn()}
    startHours={8}
    startMinutes={0}
    endHours={17}
    endMinutes={0}
    formatTime={formatTime}
    workingHoursText="Working hours are 08:00 - 17:00."
    styles={styles}
    />,
  );

    // When the component is rendered, Then the partial day section should not be displayed
    expect(queryByText('Select Specific Hours')).toBeNull();
  });

  it('renders the toggle section when the booking is for a single day', () => {
    // Given the booking is for a single day and partial day is not yet selected
    const { getByText } = render(
      <PartialDayTimeSection
        isSingleDayBooking={true}
    isPartialDay={false}
    setIsPartialDay={jest.fn()}
    setIsStartTimePickerVisible={jest.fn()}
    setIsEndTimePickerVisible={jest.fn()}
    startHours={8}
    startMinutes={0}
    endHours={17}
    endMinutes={0}
    formatTime={formatTime}
    workingHoursText="Working hours are 08:00 - 17:00."
    styles={styles}
    />,
  );

    // When the component is rendered, Then the toggle prompt should be shown
    expect(getByText('Select Specific Hours')).toBeTruthy();
    expect(
      getByText('Would you like to book off certain hours instead of the full day?'),
    ).toBeTruthy();
  });

  it('calls setIsPartialDay with a toggle function when the toggle row is pressed', () => {
    // Given a single day booking and a mocked partial day setter
    const setIsPartialDay = jest.fn();

    const { getByText } = render(
      <PartialDayTimeSection
        isSingleDayBooking={true}
    isPartialDay={false}
    setIsPartialDay={setIsPartialDay}
    setIsStartTimePickerVisible={jest.fn()}
    setIsEndTimePickerVisible={jest.fn()}
    startHours={8}
    startMinutes={0}
    endHours={17}
    endMinutes={0}
    formatTime={formatTime}
    workingHoursText="Working hours are 08:00 - 17:00."
    styles={styles}
    />,
  );

    // When the user presses the partial day toggle row
    fireEvent.press(getByText('Select Specific Hours'));

    // Then the partial day setter should be called with a toggle callback
    expect(setIsPartialDay).toHaveBeenCalledTimes(1);
    expect(typeof setIsPartialDay.mock.calls[0][0]).toBe('function');

    const toggleFn = setIsPartialDay.mock.calls[0][0];
    expect(toggleFn(false)).toBe(true);
    expect(toggleFn(true)).toBe(false);
  });

  it('renders the time selection fields when partial day is selected', () => {
    // Given the user has selected a partial day booking
    const { getByText } = render(
      <PartialDayTimeSection
        isSingleDayBooking={true}
    isPartialDay={true}
    setIsPartialDay={jest.fn()}
    setIsStartTimePickerVisible={jest.fn()}
    setIsEndTimePickerVisible={jest.fn()}
    startHours={8}
    startMinutes={30}
    endHours={12}
    endMinutes={45}
    formatTime={formatTime}
    workingHoursText="Working hours for Friday are 08:00 - 12:00."
    styles={styles}
    />,
  );

    // When the component is rendered, Then the leave hours section and selected times should be shown
    expect(getByText('Leave Hours')).toBeTruthy();
    expect(getByText('Start Time')).toBeTruthy();
    expect(getByText('End Time')).toBeTruthy();
    expect(getByText('08:30')).toBeTruthy();
    expect(getByText('12:45')).toBeTruthy();
    expect(getByText('Working hours for Friday are 08:00 - 12:00.')).toBeTruthy();
  });

  it('opens the start time picker when the start time button is pressed', () => {
    // Given the partial day time section is visible
    const setIsStartTimePickerVisible = jest.fn();

    const { getByText } = render(
      <PartialDayTimeSection
        isSingleDayBooking={true}
    isPartialDay={true}
    setIsPartialDay={jest.fn()}
    setIsStartTimePickerVisible={setIsStartTimePickerVisible}
    setIsEndTimePickerVisible={jest.fn()}
    startHours={9}
    startMinutes={0}
    endHours={11}
    endMinutes={0}
    formatTime={formatTime}
    workingHoursText="Working hours are 08:00 - 17:00."
    styles={styles}
    />,
  );

    // When the user presses the start time button
    fireEvent.press(getByText('Start Time'));

    // Then the start time picker visibility should be set to true
    expect(setIsStartTimePickerVisible).toHaveBeenCalledWith(true);
  });

  it('opens the end time picker when the end time button is pressed', () => {
    // Given the partial day time section is visible
    const setIsEndTimePickerVisible = jest.fn();

    const { getByText } = render(
      <PartialDayTimeSection
        isSingleDayBooking={true}
    isPartialDay={true}
    setIsPartialDay={jest.fn()}
    setIsStartTimePickerVisible={jest.fn()}
    setIsEndTimePickerVisible={setIsEndTimePickerVisible}
    startHours={9}
    startMinutes={0}
    endHours={11}
    endMinutes={0}
    formatTime={formatTime}
    workingHoursText="Working hours are 08:00 - 17:00."
    styles={styles}
    />,
  );

    // When the user presses the end time button
    fireEvent.press(getByText('End Time'));

    // Then the end time picker visibility should be set to true
    expect(setIsEndTimePickerVisible).toHaveBeenCalledWith(true);
  });

  it('shows the tick indicator when partial day is selected', () => {
    // Given the partial day option is currently enabled
    const { getByText } = render(
      <PartialDayTimeSection
        isSingleDayBooking={true}
    isPartialDay={true}
    setIsPartialDay={jest.fn()}
    setIsStartTimePickerVisible={jest.fn()}
    setIsEndTimePickerVisible={jest.fn()}
    startHours={8}
    startMinutes={0}
    endHours={17}
    endMinutes={0}
    formatTime={formatTime}
    workingHoursText="Working hours are 08:00 - 17:00."
    styles={styles}
    />,
  );

    // When the component is rendered, Then the selected indicator should show a tick
    expect(getByText('✓')).toBeTruthy();
  });
});
