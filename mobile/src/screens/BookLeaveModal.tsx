import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Menu, Portal, Modal as PaperModal } from 'react-native-paper';
import dayjs from 'dayjs';

import AuthenticationService from '../logic/AuthenticationService';
import { useTheme } from '../theme/colourController';
import { styles as baseStyles } from './BookLeaveModal.styles';

/**
 * Format of the leave type returned from the backend.
 * This is used to display the leave types in the modal
 * and send the selected type back to the backend.
 */
type LeaveType = {
  leaveTypeId: number;
  name: string;
  colourIcon: string;
  colourBg: string;
  iconType: string;
};

/**
 * Props for the BookLeaveModal component.
 */
type BookLeaveModalProps = {
  visible: boolean;
  initialDate: string | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

/**
 * Modal used to create a new leave request.
 * The user can select:
 * start date, end date, type of leave and add notes or reasons in a text box.
 */
export default function BookLeaveModal({
                                         visible,
                                         initialDate,
                                         onClose,
                                         onSuccess,
                                       }: BookLeaveModalProps) {
  const { theme } = useTheme();
  const styles = baseStyles(theme);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingLeaveTypes, setIsLoadingLeaveTypes] = useState<boolean>(false);
  const [isLeaveTypeMenuVisible, setIsLeaveTypeMenuVisible] = useState<boolean>(false);
  const DaysInAdvance = 14;

  /**
   * Opens the leave type dropdown menu.
   */
  const openLeaveTypeMenu = () => {
    setIsLeaveTypeMenuVisible(true);
  };

  /**
   * Closes the leave type dropdown menu.
   */
  const closeLeaveTypeMenu = () => {
    setIsLeaveTypeMenuVisible(false);
  };

  /**
   * When the modal is opened, the form should reset
   * and the leave types should be loaded from the backend.
   */
  useEffect(() => {
    if (!visible) {
      return;
    }

    setStartDate(initialDate ?? '');
    setEndDate(initialDate ?? '');
    setNotes('');
    setErrorMessage('');
    setSelectedLeaveTypeId(null);

    fetchLeaveTypes();
  }, [visible, initialDate]);

  /**
   * Loads the available leave types from the backend.
   */
  const fetchLeaveTypes = async () => {
    setIsLoadingLeaveTypes(true);

    try {
      const response = await AuthenticationService.fetch('/api/leave/types', {
        method: 'GET',
      });

      console.log('Leave types status:', response.status);

      const text = await response.text();
      console.log('Leave types raw response:', text);

      if (!response.ok) {
        setErrorMessage(`Failed to load leave types. Status: ${response.status}`);
        setLeaveTypes([]);
        return;
      }

      if (!text) {
        setErrorMessage('Leave types response was empty.');
        setLeaveTypes([]);
        return;
      }

      const data: LeaveType[] = JSON.parse(text);
      console.log('Parsed leave types:', data);

      setLeaveTypes(data);

      if (data.length > 0) {
        const defaultLeaveType =
          data.find((leaveType) => leaveType.name.toLowerCase() === 'holiday')
          ?? data[0];

        console.log('Default leave type:', defaultLeaveType);

        setSelectedLeaveTypeId(defaultLeaveType.leaveTypeId);
      }

    } catch (error) {
      console.error('Error fetching leave types:', error);
      setErrorMessage('Unable to load leave types.');
    } finally {
      setIsLoadingLeaveTypes(false);
    }
  };

  /**
   * The currently selected leave type object.
   */
  const selectedLeaveType = leaveTypes.find(
    (leaveType) => leaveType.leaveTypeId === selectedLeaveTypeId
  );

  /**
   * Ensuring the minimum booking date adheres to the number of days in advance
   * that the leave request must be made in.
   */
  const minimumBookableDate = useMemo(() => {
    return dayjs().add(DaysInAdvance, 'day').startOf('day');
  }, []);

  /**
   * Validation the form values.
   * Returns an empty string when valid, otherwise returns the validation message.
   */
  const validateForm = (): string => {
    // Checking if the start and end date are provided
    if (!startDate.trim() || !endDate.trim()) {
      return 'Please enter both the start and end date.';
    }

    // Checking the leave type is selected
    if (selectedLeaveTypeId === null) {
      return 'Please select a leave type.';
    }

    // Parsing the dates using dayjs to get them in the correct format
    const parsedStartDate = dayjs(startDate);
    const parsedEndDate = dayjs(endDate);

    // Checking if the dates are valid
    if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
      return 'Please enter valid dates in YYYY-MM-DD format.';
    }

    // Checking if the start date is after the end date
    if (parsedStartDate.isAfter(parsedEndDate, 'day')) {
      return 'The start date cannot be after the end date.';
    }

    // Ensuring the start date is at least 14 days past the current date
    if (parsedStartDate.isBefore(minimumBookableDate, 'day')) {
      return 'Leave requests must be made at least 14 days in advance.';
    }
    return '';
  };

  /**
   * Sends the leave request to the backend.
   * On success, the screen is refreshed and the modal is closed.
   */
  const handleSubmit = async () => {
    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    console.log('Submitting leave request:', {
      startDate,
      endDate,
      leaveTypeId: selectedLeaveTypeId,
      notes: notes.trim(),
    });

    try {
      const response = await AuthenticationService.fetch('/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          leaveTypeId: selectedLeaveTypeId,
          notes: notes.trim(),
        }),
      });

      console.log('Submit response status:', response.status);

      const responseText = await response.text();
      console.log('Submit response body:', responseText);

      if (!response.ok) {
        console.log(`Status: ${response.status}, Response: ${responseText}`);
        setErrorMessage(
          responseText || `Unable to submit leave request. Status: ${response.status}`
        );
        return;
      }

      console.log('Leave submitted successfully');

      onClose();
      await onSuccess();

    } catch (error) {
      console.error('Error submitting leave request:', error);
      setErrorMessage('Something went wrong while submitting the request.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalWrapper}
      >
        <View style={styles.modalContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Book Time Off</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeButtonWrapper}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Selected Start Date</Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.greyPrimaryMainText}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Selected End Date</Text>
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.greyPrimaryMainText}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Type of Leave</Text>

            {isLoadingLeaveTypes ? (
              <Text style={styles.secondaryText}>Loading leave types...</Text>
            ) : (
              <Menu
                visible={isLeaveTypeMenuVisible}
                onDismiss={closeLeaveTypeMenu}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      console.log('Opening leave type menu');
                      openLeaveTypeMenu();
                    }}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedLeaveType ? selectedLeaveType.name : 'Select leave type'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                }
              >
                {leaveTypes.map((leaveType) => (
                  <Menu.Item
                    key={leaveType.leaveTypeId}
                    onPress={() => {
                      console.log('Selected leave type:', leaveType);
                      setSelectedLeaveTypeId(leaveType.leaveTypeId);
                      closeLeaveTypeMenu();
                    }}
                    title={leaveType.name}
                  />
                ))}
              </Menu>
            )}
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Add any additional details...</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              placeholderTextColor={theme.greyPrimaryMainText}
              multiline={true}
              textAlignVertical="top"
              style={styles.notesInput}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </PaperModal>
    </Portal>
  );
}