/**
 * @format
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import BookLeaveModal from '../src/screens/BookLeaveModal';
import LeaveService from '../src/logic/LeaveService';
import { HttpException } from '../src/exception/HttpException';
import * as LeaveBookingLogic from '../src/logic/LeaveBookingLogic';

jest.mock('../src/logic/LeaveService');

jest.mock('../src/theme/colourController', () => ({
  useTheme: () => ({
    theme: {
      greyPrimaryMainText: '#666666',
      white: '#FFFFFF',
      black: '#000000',
      redPrimary: '#FF0000',
    },
  }),
}));

jest.mock('react-native-paper', () => {
  const mockReact = require('react');
  const { View } = require('react-native');

  return {
    Portal: ({ children }: any) =>
      mockReact.createElement(View, null, children),
    Modal: ({ visible, children }: any) =>
      visible ? mockReact.createElement(View, null, children) : null,
  };
});

jest.mock('react-native-paper-dates', () => {
  const mockReact = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return {
    DatePickerInput: ({ value, onChange }: any) =>
      mockReact.createElement(
        View,
        null,
        mockReact.createElement(
          Text,
          null,
          value ? 'Date Selected' : 'No Date Selected',
        ),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: () => onChange(new Date('2026-04-20T00:00:00')) },
          mockReact.createElement(Text, null, 'Set Date Picker To Valid'),
        ),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: () => onChange(new Date('2000-04-10T00:00:00')) },
          mockReact.createElement(Text, null, 'Set Date Picker To TooSoon'),
        ),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: () => onChange(new Date('2026-04-25T00:00:00')) },
          mockReact.createElement(Text, null, 'Set Date Picker To Later'),
        ),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: () => onChange(new Date('2026-04-18T00:00:00')) },
          mockReact.createElement(Text, null, 'Set Date Picker To Earlier'),
        ),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: () => onChange(new Date('invalid')) },
          mockReact.createElement(Text, null, 'Set Date Picker To Invalid'),
        ),
        mockReact.createElement(
          TouchableOpacity,
          { onPress: () => onChange(undefined) },
          mockReact.createElement(Text, null, 'Clear Date Picker'),
        ),
      ),

    TimePickerModal: ({ visible, label, onConfirm, onDismiss }: any) =>
      visible
        ? mockReact.createElement(
          View,
          null,
          mockReact.createElement(Text, null, label),
          mockReact.createElement(
            TouchableOpacity,
            { onPress: () => onConfirm({ hours: 10, minutes: 30 }) },
            mockReact.createElement(Text, null, `Confirm ${label}`),
          ),
          mockReact.createElement(
            TouchableOpacity,
            { onPress: onDismiss },
            mockReact.createElement(Text, null, `Dismiss ${label}`),
          ),
        )
        : null,
  };
});

jest.mock('../src/screens/LeaveTypePickerModal', () => {
  const mockReact = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return function MockLeaveTypePickerModal(props: any) {
    if (!props.visible) {
      return null;
    }

    return mockReact.createElement(
      View,
      null,
      mockReact.createElement(Text, null, 'Leave Type Picker Modal'),
      ...props.leaveTypes.map((leaveType: any) =>
        mockReact.createElement(
          TouchableOpacity,
          {
            key: leaveType.leaveTypeId,
            onPress: () => {
              props.setSelectedLeaveTypeId(leaveType.leaveTypeId);
              props.onDismiss();
            },
          },
          mockReact.createElement(Text, null, leaveType.name),
        ),
      ),
      mockReact.createElement(
        TouchableOpacity,
        { onPress: props.onDismiss },
        mockReact.createElement(Text, null, 'Dismiss Leave Type Picker'),
      ),
    );
  };
});

jest.mock('../src/screens/PartialDayTimeSection', () => {
  const mockReact = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return function MockPartialDayTimeSection(props: any) {
    if (!props.isSingleDayBooking) {
      return null;
    }

    return mockReact.createElement(
      View,
      null,
      mockReact.createElement(Text, null, 'Partial Day Section'),
      mockReact.createElement(Text, null, props.workingHoursText),
      mockReact.createElement(
        Text,
        null,
        props.formatTime(props.startHours, props.startMinutes),
      ),
      mockReact.createElement(
        Text,
        null,
        props.formatTime(props.endHours, props.endMinutes),
      ),
      mockReact.createElement(
        TouchableOpacity,
        {
          onPress: () =>
            props.setIsPartialDay((previousValue: boolean) => !previousValue),
        },
        mockReact.createElement(Text, null, 'Toggle Partial Day'),
      ),
      mockReact.createElement(
        TouchableOpacity,
        { onPress: () => props.setIsStartTimePickerVisible(true) },
        mockReact.createElement(Text, null, 'Open Start Time Picker'),
      ),
      mockReact.createElement(
        TouchableOpacity,
        { onPress: () => props.setIsEndTimePickerVisible(true) },
        mockReact.createElement(Text, null, 'Open End Time Picker'),
      ),
    );
  };
});

jest.mock('../src/logic/LeaveBookingLogic', () => ({
  daysInAdvance: 14,
  monThurStartHour: 8,
  monThurStartMin: 0,
  monThurEndHour: 17,
  monThurEndMin: 0,
  getWorkingDayBounds: jest.fn((date: Date) => {
    const dayIndex = new Date(date).getDay();

    if (dayIndex === 5) {
      return {
        start: { hours: 8, minutes: 0 },
        end: { hours: 12, minutes: 0 },
      };
    }

    return {
      start: { hours: 8, minutes: 0 },
      end: { hours: 17, minutes: 0 },
    };
  }),
  formatTime: jest.fn((hours: number, minutes: number) =>
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
  ),
  validatePartialDayTimes: jest.fn(() => ''),
  buildSubmissionDates: jest.fn(() => ({
    startDate: '2026-04-20T08:00:00',
    endDate: '2026-04-20T17:00:00',
  })),
  getWorkingHoursText: jest.fn(() => 'Working hours are 08:00 - 17:00.'),
}));

describe('BookLeaveModal', () => {
  // TODO: change this and other dates to mock dates relative to each-other.
  const futureDate = '9999-04-20';

  const mockLeaveTypes = [
    {
      leaveTypeId: 1,
      name: 'Annual Leave',
      colourIcon: '#111111',
      colourBg: '#FFFFFF',
      iconType: 'calendar',
    },
    {
      leaveTypeId: 2,
      name: 'Sick Leave',
      colourIcon: '#222222',
      colourBg: '#EEEEEE',
      iconType: 'medical-bag',
    },
  ];

  const createDeferred = () => {
    let resolve!: (value: any) => void;
    let reject!: (reason?: any) => void;

    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };

  const renderVisibleModal = (
    onClose = jest.fn(),
    onSuccess = jest.fn(),
    initialDate: string | null = futureDate,
  ) =>
    render(
      <BookLeaveModal
        visible={true}
        initialDate={initialDate}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

  const waitForLeaveTypesToLoad = async (getByText: any) => {
    await waitFor(() => {
      expect(getByText('Select leave type')).toBeTruthy();
    });
  };

  const selectAnnualLeave = async (getByText: any) => {
    fireEvent.press(getByText('Select leave type'));

    await waitFor(() => {
      expect(getByText('Leave Type Picker Modal')).toBeTruthy();
    });

    fireEvent.press(getByText('Annual Leave'));

    await waitFor(() => {
      expect(getByText('Annual Leave')).toBeTruthy();
    });
  };

  const pressStartDateButton = (getAllByText: any, label: string) => {
    fireEvent.press(getAllByText(label)[0]);
  };

  const pressEndDateButton = (getAllByText: any, label: string) => {
    fireEvent.press(getAllByText(label)[1]);
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (LeaveService.getLeaveTypes as jest.Mock).mockResolvedValue(mockLeaveTypes);
    (LeaveService.createLeave as jest.Mock).mockResolvedValue(undefined);
    (LeaveBookingLogic.validatePartialDayTimes as jest.Mock).mockReturnValue('');
    (LeaveBookingLogic.buildSubmissionDates as jest.Mock).mockReturnValue({
      startDate: '2026-04-20T08:00:00',
      endDate: '2026-04-20T17:00:00',
    });
    (LeaveBookingLogic.getWorkingHoursText as jest.Mock).mockReturnValue(
      'Working hours are 08:00 - 17:00.',
    );
  });

  it('does not load leave types when the modal is not visible', () => {
    // Given the modal is not visible
    render(
      <BookLeaveModal
        visible={false}
        initialDate={futureDate}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
      />,
    );

    // When the component is rendered in a hidden state
    // Then the leave types should not be loaded
    expect(LeaveService.getLeaveTypes).not.toHaveBeenCalled();
  });

  it('loads leave types when the modal becomes visible', async () => {
    // Given the modal is visible and leave types can be fetched successfully
    const { getByText } = renderVisibleModal();

    // When the modal is rendered
    // Then the leave type selector should appear after loading
    await waitFor(() => {
      expect(LeaveService.getLeaveTypes).toHaveBeenCalledTimes(1);
      expect(getByText('Select leave type')).toBeTruthy();
    });
  });

  it('shows the loading text while leave types are being fetched', async () => {
    // Given leave types are still loading
    const deferred = createDeferred();
    (LeaveService.getLeaveTypes as jest.Mock).mockReturnValueOnce(deferred.promise);

    const { getByText } = renderVisibleModal();

    // When the modal renders before the request resolves
    // Then the loading message should be shown
    await waitFor(() => {
      expect(getByText('Loading leave types...')).toBeTruthy();
    });

    deferred.resolve(mockLeaveTypes);

    await waitFor(() => {
      expect(getByText('Select leave type')).toBeTruthy();
    });
  });

  it('shows an error message when leave types fail to load', async () => {
    // Given fetching leave types fails
    (LeaveService.getLeaveTypes as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch'),
    );

    // When the modal is rendered
    const { getByText } = renderVisibleModal();

    // Then the leave type loading error message should be shown
    await waitFor(() => {
      expect(getByText('Unable to load leave types.')).toBeTruthy();
    });
  });

  it('calls onClose when the close button is pressed', async () => {
    // Given the modal is visible
    const onClose = jest.fn();
    const { getByText } = renderVisibleModal(onClose, jest.fn());

    await waitFor(() => {
      expect(getByText('Submit')).toBeTruthy();
    });

    // When the user presses the modal close button
    fireEvent.press(getByText('×'));

    // Then the close callback should be called
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a validation message when dates are missing', async () => {
    // Given the modal has no initial date and therefore no selected dates
    const { getByText } = renderVisibleModal(jest.fn(), jest.fn(), null);

    await waitFor(() => {
      expect(LeaveService.getLeaveTypes).toHaveBeenCalledTimes(1);
    });

    // When the user submits the form without selecting dates
    fireEvent.press(getByText('Submit'));

    // Then the missing date validation message should be shown
    await waitFor(() => {
      expect(
        getByText('Please enter both the start and end date.'),
      ).toBeTruthy();
    });
  });

  it('shows a validation message when no leave type has been selected', async () => {
    // Given valid dates exist but no leave type has been selected
    const { getByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);

    // When the user submits the form without selecting a leave type
    fireEvent.press(getByText('Submit'));

    // Then the leave type validation message should be shown
    await waitFor(() => {
      expect(getByText('Please select a leave type.')).toBeTruthy();
    });
  });

  it('allows the user to open the leave type picker and dismiss it without selecting', async () => {
    // Given the modal is visible with available leave types
    const { getByText, queryByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);

    // When the leave type picker is opened and then dismissed
    fireEvent.press(getByText('Select leave type'));

    await waitFor(() => {
      expect(getByText('Leave Type Picker Modal')).toBeTruthy();
    });

    fireEvent.press(getByText('Dismiss Leave Type Picker'));

    // Then the picker should close
    await waitFor(() => {
      expect(queryByText('Leave Type Picker Modal')).toBeNull();
    });
  });

  it('allows the user to open the leave type picker and select a leave type', async () => {
    // Given the modal is visible with available leave types
    const { getByText, queryByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);

    // When the leave type picker is opened
    fireEvent.press(getByText('Select leave type'));

    // Then the picker should appear and the selected leave type should update after a choice is made
    await waitFor(() => {
      expect(getByText('Leave Type Picker Modal')).toBeTruthy();
    });

    fireEvent.press(getByText('Annual Leave'));

    await waitFor(() => {
      expect(queryByText('Leave Type Picker Modal')).toBeNull();
      expect(getByText('Annual Leave')).toBeTruthy();
    });
  });

  it('submits the leave request successfully and trims the notes', async () => {
    // Given the modal is visible with a selected leave type and extra whitespace in notes
    const onClose = jest.fn();
    const onSuccess = jest.fn();

    const { getByText, getByPlaceholderText } = renderVisibleModal(
      onClose,
      onSuccess,
    );

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the user enters notes and submits the request
    fireEvent.changeText(
      getByPlaceholderText('Optional notes'),
      '  Annual leave note  ',
    );
    fireEvent.press(getByText('Submit'));

    // Then the leave service should receive the built dates, selected leave type and trimmed notes
    await waitFor(() => {
      expect(LeaveService.createLeave).toHaveBeenCalledWith({
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        leaveTypeId: 1,
        notes: 'Annual leave note',
      });
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows a validation message when the start date is invalid', async () => {
    // Given the user selects an invalid start date and a valid leave type
    const { getByText, getAllByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the invalid start date is selected and the form is submitted
    pressStartDateButton(getAllByText, 'Set Date Picker To Invalid');
    fireEvent.press(getByText('Submit'));

    // Then the invalid dates validation message should be shown
    await waitFor(() => {
      expect(getByText('Please select valid dates.')).toBeTruthy();
    });
  });

  it('shows a validation message when the start date is before the minimum bookable date', async () => {
    // Given a selected leave type and a start date that is too soon
    const { getByText, getAllByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the start date is moved inside the blocked booking window and submitted
    pressStartDateButton(getAllByText, 'Set Date Picker To TooSoon');
    fireEvent.press(getByText('Submit'));

    // Then the advance booking validation message should be shown
    await waitFor(() => {
      expect(
        getByText('Leave requests must be made at least 14 days in advance.'),
      ).toBeTruthy();
    });
  });

  it('shows a validation message when the end date becomes earlier than the start date', async () => {
    // Given a selected leave type and an end date that is changed to before the start date
    const { getByText, getAllByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the end date is moved earlier than the existing start date and submitted
    pressEndDateButton(getAllByText, 'Set Date Picker To TooSoon');
    fireEvent.press(getByText('Submit'));

    // Then the date ordering validation message should be shown
    await waitFor(() => {
      expect(
        getByText('The start date cannot be after the end date.'),
      ).toBeTruthy();
    });
  });

  it('updates the end date when the start date is moved after the existing end date', async () => {
    // Given the modal starts with the same start and end date
    const { getByText, getAllByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the end date is first made earlier and then the start date is moved later
    pressEndDateButton(getAllByText, 'Set Date Picker To Earlier');
    pressStartDateButton(getAllByText, 'Set Date Picker To Later');
    fireEvent.press(getByText('Submit'));

    // Then submission should succeed because the component aligns the end date to the new start date
    await waitFor(() => {
      expect(LeaveService.createLeave).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error when buildSubmissionDates returns null', async () => {
    // Given validation passes but the submission dates cannot be built
    (LeaveBookingLogic.buildSubmissionDates as jest.Mock).mockReturnValueOnce(
      null,
    );

    const { getByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the user submits the form
    fireEvent.press(getByText('Submit'));

    // Then a valid dates error message should be shown
    await waitFor(() => {
      expect(getByText('Please select valid dates.')).toBeTruthy();
    });
  });

  it('shows the session expired message when the backend returns a 401 HttpException', async () => {
    // Given the backend rejects the request with an unauthorized HttpException
    (LeaveService.createLeave as jest.Mock).mockRejectedValueOnce(
      new HttpException(401, 'Unauthorized'),
    );

    const { getByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the user submits the request
    fireEvent.press(getByText('Submit'));

    // Then the session expired message should be shown
    await waitFor(() => {
      expect(
        getByText('Session expired. Please sign in again.'),
      ).toBeTruthy();
    });
  });

  it('shows the HttpException message when the backend returns a non-401 HttpException', async () => {
    // Given the backend rejects the request with a business error HttpException
    (LeaveService.createLeave as jest.Mock).mockRejectedValueOnce(
      new HttpException(400, 'Leave type is required.'),
    );

    const { getByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the user submits the request
    fireEvent.press(getByText('Submit'));

    // Then the backend error message should be shown
    await waitFor(() => {
      expect(getByText('Leave type is required.')).toBeTruthy();
    });
  });

  it('shows a generic fallback message when HttpException has an empty message', async () => {
    // Given the backend rejects the request with a HttpException without a useful message
    (LeaveService.createLeave as jest.Mock).mockRejectedValueOnce(
      new HttpException(400, ''),
    );

    const { getByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the user submits the request
    fireEvent.press(getByText('Submit'));

    // Then the generic leave submission message should be shown
    await waitFor(() => {
      expect(getByText('Unable to submit leave request.')).toBeTruthy();
    });
  });

  it('shows a generic error message when an unknown error occurs during submission', async () => {
    // Given the backend rejects the request with a non-HttpException error
    (LeaveService.createLeave as jest.Mock).mockRejectedValueOnce(
      new Error('Unexpected failure'),
    );

    const { getByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the user submits the request
    fireEvent.press(getByText('Submit'));

    // Then the generic failure message should be shown
    await waitFor(() => {
      expect(
        getByText('Something went wrong while submitting the request.'),
      ).toBeTruthy();
    });
  });

  it('validates partial day times when partial day booking is enabled', async () => {
    // Given the modal is in partial day mode and the partial-day validation fails
    (LeaveBookingLogic.validatePartialDayTimes as jest.Mock).mockReturnValueOnce(
      'End time must be later than the start time.',
    );

    const { getByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);
    await selectAnnualLeave(getByText);

    // When the user enables partial day and submits
    fireEvent.press(getByText('Toggle Partial Day'));
    fireEvent.press(getByText('Submit'));

    // Then the validation error should be shown and the leave request should not be sent
    await waitFor(() => {
      expect(
        getByText('End time must be later than the start time.'),
      ).toBeTruthy();
      expect(LeaveService.createLeave).not.toHaveBeenCalled();
    });
  });

  it('resets partial day mode when the booking becomes multi-day', async () => {
    // Given the booking starts as a single-day booking and partial day is enabled
    const { getByText, getAllByText, queryByText } = renderVisibleModal();

    await waitForLeaveTypesToLoad(getByText);

    fireEvent.press(getByText('Toggle Partial Day'));

    await waitFor(() => {
      expect(getByText('Partial Day Section')).toBeTruthy();
    });

    // When the end date is changed to a different day
    pressEndDateButton(getAllByText, 'Set Date Picker To Later');

    // Then the partial day section should no longer be shown
    await waitFor(() => {
      expect(queryByText('Partial Day Section')).toBeNull();
    });
  });

  it('opens the time pickers and updates the selected times when confirmed', async () => {
    // Given the modal is visible for a single day booking
    const { getByText } = renderVisibleModal();

    await waitFor(() => {
      expect(getByText('Submit')).toBeTruthy();
    });

    // When the start and end time pickers are opened and confirmed
    fireEvent.press(getByText('Open Start Time Picker'));

    await waitFor(() => {
      expect(getByText('Select start time')).toBeTruthy();
    });

    fireEvent.press(getByText('Confirm Select start time'));

    fireEvent.press(getByText('Open End Time Picker'));

    await waitFor(() => {
      expect(getByText('Select end time')).toBeTruthy();
    });

    fireEvent.press(getByText('Confirm Select end time'));

    // Then the component should continue rendering after both picker confirmations
    await waitFor(() => {
      expect(getByText('Submit')).toBeTruthy();
    });
  });

  it('closes the time pickers when dismissed', async () => {
    // Given the modal is visible for a single day booking
    const { getByText, queryByText } = renderVisibleModal();

    await waitFor(() => {
      expect(getByText('Submit')).toBeTruthy();
    });

    // When the start time picker is opened and dismissed
    fireEvent.press(getByText('Open Start Time Picker'));

    await waitFor(() => {
      expect(getByText('Select start time')).toBeTruthy();
    });

    fireEvent.press(getByText('Dismiss Select start time'));

    await waitFor(() => {
      expect(queryByText('Select start time')).toBeNull();
    });

    // When the end time picker is opened and dismissed
    fireEvent.press(getByText('Open End Time Picker'));

    await waitFor(() => {
      expect(getByText('Select end time')).toBeTruthy();
    });

    fireEvent.press(getByText('Dismiss Select end time'));

    // Then the end picker should no longer be visible
    await waitFor(() => {
      expect(queryByText('Select end time')).toBeNull();
    });
  });
});
