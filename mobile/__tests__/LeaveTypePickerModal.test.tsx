/**
 * @format
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LeaveTypePickerModal from '../src/screens/LeaveTypePickerModal';

jest.mock('react-native-paper', () => {
  const { View } = require('react-native');

  return {
    Modal: ({ visible, children }: any) => (visible ? <View>{children}</View> : null),
  };
});

describe('LeaveTypePickerModal', () => {
  const styles = {
    leaveTypeModalWrapper: {},
    leaveTypeModalContainer: {},
    leaveTypeHeaderRow: {},
    leaveTypeModalTitle: {},
    closeButtonWrapper: {},
    closeButtonText: {},
    leaveTypeList: {},
    leaveTypeListContent: {},
    leaveTypeOption: {},
    leaveTypeOptionSelected: {},
    leaveTypeOptionText: {},
    leaveTypeOptionTextSelected: {},
  };

  const leaveTypes = [
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

  it('renders nothing when not visible', () => {
    // Given the leave type picker is not visible
    const { queryByText } = render(
      <LeaveTypePickerModal
        visible={false}
        onDismiss={jest.fn()}
        leaveTypes={leaveTypes}
        selectedLeaveTypeId={null}
        setSelectedLeaveTypeId={jest.fn()}
        styles={styles}
      />,
    );

    // When the component is rendered
    // Then the modal content should not be shown
    expect(queryByText('Select Leave Type')).toBeNull();
    expect(queryByText('Annual Leave')).toBeNull();
  });

  it('renders the title and all leave type options when visible', () => {
    // Given the leave type picker is visible with available leave types
    const { getByText } = render(
      <LeaveTypePickerModal
        visible={true}
        onDismiss={jest.fn()}
        leaveTypes={leaveTypes}
        selectedLeaveTypeId={null}
        setSelectedLeaveTypeId={jest.fn()}
        styles={styles}
      />,
    );

    // When the component is rendered
    // Then the modal title and each leave type should be displayed
    expect(getByText('Select Leave Type')).toBeTruthy();
    expect(getByText('Annual Leave')).toBeTruthy();
    expect(getByText('Sick Leave')).toBeTruthy();
  });

  it('calls onDismiss when the close button is pressed', () => {
    // Given the leave type picker is visible
    const onDismiss = jest.fn();

    const { getByText } = render(
      <LeaveTypePickerModal
        visible={true}
        onDismiss={onDismiss}
        leaveTypes={leaveTypes}
        selectedLeaveTypeId={null}
        setSelectedLeaveTypeId={jest.fn()}
        styles={styles}
      />,
    );

    // When the close button is pressed
    fireEvent.press(getByText('×'));

    // Then the dismiss callback should be called
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('sets the selected leave type and closes the modal when an option is pressed', () => {
    // Given the leave type picker is visible with mocked callbacks
    const onDismiss = jest.fn();
    const setSelectedLeaveTypeId = jest.fn();

    const { getByText } = render(
      <LeaveTypePickerModal
        visible={true}
        onDismiss={onDismiss}
        leaveTypes={leaveTypes}
        selectedLeaveTypeId={null}
        setSelectedLeaveTypeId={setSelectedLeaveTypeId}
        styles={styles}
      />,
    );

    // When the user selects Annual Leave
    fireEvent.press(getByText('Annual Leave'));

    // Then the selected leave type should be updated and the modal should be closed
    expect(setSelectedLeaveTypeId).toHaveBeenCalledWith(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders correctly when a leave type is already selected', () => {
    // Given a leave type is already selected
    const { getByText } = render(
      <LeaveTypePickerModal
        visible={true}
        onDismiss={jest.fn()}
        leaveTypes={leaveTypes}
        selectedLeaveTypeId={2}
        setSelectedLeaveTypeId={jest.fn()}
        styles={styles}
      />,
    );

    // When the component is rendered, Then the selected leave type should still appear in the list
    expect(getByText('Sick Leave')).toBeTruthy();
  });

  it('renders correctly when there are no leave types available', () => {
    // Given the modal is visible but there are no leave types to show
    const { getByText, queryByText } = render(
      <LeaveTypePickerModal
        visible={true}
        onDismiss={jest.fn()}
        leaveTypes={[]}
        selectedLeaveTypeId={null}
        setSelectedLeaveTypeId={jest.fn()}
        styles={styles}
      />,
    );

    // When the component is rendered, Then the title should still be shown and no leave type options should appear
    expect(getByText('Select Leave Type')).toBeTruthy();
    expect(queryByText('Annual Leave')).toBeNull();
    expect(queryByText('Sick Leave')).toBeNull();
  });
});
