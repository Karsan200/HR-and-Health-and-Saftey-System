import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Portal, Modal as PaperModal } from 'react-native-paper';
import dayjs from 'dayjs';

import { useTheme } from '../theme/colourController';
import { styles as baseStyles } from './BookLeaveModal.styles';
import { HttpException } from '../exception/HttpException.ts';
import LeaveService, { LeaveType } from '../logic/LeaveService';

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
  const [isLeaveTypePickerVisible, setIsLeaveTypePickerVisible] = useState<boolean>(false);

  const DaysInAdvance = 14;

  const openLeaveTypePicker = () => {
    setIsLeaveTypePickerVisible(true);
  };

  const closeLeaveTypePicker = () => {
    setIsLeaveTypePickerVisible(false);
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
    setIsLeaveTypePickerVisible(false);

    fetchLeaveTypes();
  }, [visible, initialDate]);

  /**
   * Using the LeaveService to load the available leave types from the backend.
   */
  const fetchLeaveTypes = async () => {
    setIsLoadingLeaveTypes(true);

    try {
      const data = await LeaveService.getLeaveTypes();
      setLeaveTypes(data);
    } catch {
      setErrorMessage('Unable to load leave types.');
      setLeaveTypes([]);
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
   * Validating the form values.
   * Returns an empty string when valid, otherwise returns the validation message.
   */
  const validateForm = (): string => {
    if (!startDate.trim() || !endDate.trim()) {
      return 'Please enter both the start and end date.';
    }

    if (selectedLeaveTypeId === null) {
      return 'Please select a leave type.';
    }

    const parsedStartDate = dayjs(startDate);
    const parsedEndDate = dayjs(endDate);

    if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
      return 'Please enter valid dates in YYYY-MM-DD format.';
    }

    if (parsedStartDate.isAfter(parsedEndDate, 'day')) {
      return 'The start date cannot be after the end date.';
    }

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

    try {
      await LeaveService.createLeave({
        startDate,
        endDate,
        leaveTypeId: selectedLeaveTypeId as number,
        notes: notes.trim(),
      });

      onClose();
      await onSuccess();
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.statusCode === 401) {
          setErrorMessage('Session expired. Please sign in again.');
          return;
        }

        setErrorMessage(error.message || 'Unable to submit leave request.');
        return;
      }

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
                  <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={openLeaveTypePicker}
                      activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedLeaveType ? selectedLeaveType.name : 'Select leave type'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
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

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </PaperModal>

        <PaperModal
            visible={isLeaveTypePickerVisible}
            onDismiss={closeLeaveTypePicker}
            contentContainerStyle={styles.leaveTypeModalWrapper}
        >
          <View style={styles.leaveTypeModalContainer}>
            <View style={styles.leaveTypeHeaderRow}>
              <Text style={styles.leaveTypeModalTitle}>Select Leave Type</Text>

              <TouchableOpacity
                  onPress={closeLeaveTypePicker}
                  style={styles.closeButtonWrapper}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.leaveTypeList}
                contentContainerStyle={styles.leaveTypeListContent}
                showsVerticalScrollIndicator={false}
            >
              {leaveTypes.map((leaveType) => {
                const isSelected = leaveType.leaveTypeId === selectedLeaveTypeId;

                return (
                    <TouchableOpacity
                        key={leaveType.leaveTypeId}
                        style={[
                          styles.leaveTypeOption,
                          isSelected && styles.leaveTypeOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedLeaveTypeId(leaveType.leaveTypeId);
                          closeLeaveTypePicker();
                        }}
                        activeOpacity={0.8}
                    >
                      <Text
                          style={[
                            styles.leaveTypeOptionText,
                            isSelected && styles.leaveTypeOptionTextSelected,
                          ]}
                          numberOfLines={1}
                      >
                        {leaveType.name}
                      </Text>
                    </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </PaperModal>
      </Portal>
  );
}