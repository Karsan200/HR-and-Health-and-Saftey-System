import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Portal, Modal as PaperModal } from 'react-native-paper';
import dayjs from 'dayjs';

import { useTheme } from '../theme/colourController';
import { styles as baseStyles } from './BookLeaveModal.styles';
import { HttpException } from '../exception/HttpException.ts';
import LeaveService, { LeaveType } from '../logic/LeaveService';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';
import LeaveTypePickerModal from './LeaveTypePickerModal';
import PartialDayTimeSection from './PartialDayTimeSection';
import {
  daysInAdvance,
  monThurStartHour,
  monThurStartMin,
  monThurEndHour,
  monThurEndMin,
  getWorkingDayBounds,
  formatTime,
  validatePartialDayTimes,
  buildSubmissionDates,
  getWorkingHoursText,
} from '../logic/LeaveBookingLogic';

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

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingLeaveTypes, setIsLoadingLeaveTypes] = useState<boolean>(false);
  const [isLeaveTypePickerVisible, setIsLeaveTypePickerVisible] = useState<boolean>(false);

  const [isPartialDay, setIsPartialDay] = useState<boolean>(false);
  const [startHours, setStartHours] = useState<number>(monThurStartHour);
  const [startMinutes, setStartMinutes] = useState<number>(monThurStartMin);
  const [endHours, setEndHours] = useState<number>(monThurEndHour);
  const [endMinutes, setEndMinutes] = useState<number>(monThurEndMin);
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState<boolean>(false);
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState<boolean>(false);

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

    const initialSelectedDate = initialDate ? dayjs(initialDate).toDate() : undefined;
    const initialBounds = initialSelectedDate
      ? getWorkingDayBounds(initialSelectedDate)
      : getWorkingDayBounds(new Date());

    setStartDate(initialSelectedDate);
    setEndDate(initialSelectedDate);
    setNotes('');
    setErrorMessage('');
    setSelectedLeaveTypeId(null);
    setIsLeaveTypePickerVisible(false);
    setIsPartialDay(false);
    setIsStartTimePickerVisible(false);
    setIsEndTimePickerVisible(false);
    setStartHours(initialBounds.start.hours);
    setStartMinutes(initialBounds.start.minutes);
    setEndHours(initialBounds.end.hours);
    setEndMinutes(initialBounds.end.minutes);

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
    return dayjs().add(daysInAdvance, 'day').startOf('day').toDate();
  }, []);

  const isSingleDayBooking = useMemo(() => {
    if (!startDate || !endDate) {
      return false;
    }

    return dayjs(startDate).isSame(dayjs(endDate), 'day');
  }, [startDate, endDate]);

  useEffect(() => {
    if (!isSingleDayBooking) {
      setIsPartialDay(false);
      return;
    }

    if (!startDate) {
      return;
    }

    const bounds = getWorkingDayBounds(startDate);
    setStartHours(bounds.start.hours);
    setStartMinutes(bounds.start.minutes);
    setEndHours(bounds.end.hours);
    setEndMinutes(bounds.end.minutes);
  }, [isSingleDayBooking, startDate]);

  const commonDatePickerProps = {
    mode: 'outlined' as const,
    locale: 'en-GB',
    validRange: { startDate: minimumBookableDate },
    inputMode: 'start' as const,
    underlineColor: 'transparent',
    placeholder: 'DD/MM/YYYY',
    outlineStyle: styles.datePickerOutline,
    style: styles.datePickerInput,
  } as const;

  /**
   * Validating the form values.
   * Returns an empty string when valid, otherwise returns the validation message.
   */
  const validateForm = (): string => {
    if (!startDate || !endDate) {
      return 'Please enter both the start and end date.';
    }

    if (selectedLeaveTypeId === null) {
      return 'Please select a leave type.';
    }

    const parsedStartDate = dayjs(startDate);
    const parsedEndDate = dayjs(endDate);
    const minimumDate = dayjs(minimumBookableDate);

    if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
      return 'Please select valid dates.';
    }

    if (parsedStartDate.isAfter(parsedEndDate, 'day')) {
      return 'The start date cannot be after the end date.';
    }

    if (parsedStartDate.isBefore(minimumDate, 'day')) {
      return `Leave requests must be made at least ${daysInAdvance} days in advance.`;
    }

    if (parsedEndDate.isBefore(minimumDate, 'day')) {
      return `Leave requests must be made at least ${daysInAdvance} days in advance.`;
    }

    if (isPartialDay) {
      return validatePartialDayTimes(
        startDate,
        endDate,
        startHours,
        startMinutes,
        endHours,
        endMinutes,
      );
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

    const submissionDates = buildSubmissionDates(
      startDate,
      endDate,
      isPartialDay,
      startHours,
      startMinutes,
      endHours,
      endMinutes,
    );

    if (!submissionDates) {
      setErrorMessage('Please select valid dates.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await LeaveService.createLeave({
        startDate: submissionDates.startDate,
        endDate: submissionDates.endDate,
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

  const workingHoursText = getWorkingHoursText(startDate);

  return (
      <Portal>
        <PaperModal
            visible={visible}
            onDismiss={onClose}
            contentContainerStyle={styles.modalWrapper}
        >
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.headerRow}>
              <Text style={styles.title}>Book Time Off</Text>

              <TouchableOpacity onPress={onClose} style={styles.closeButtonWrapper}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </ScrollView>

            <ScrollView contentContainerStyle={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Selected Start Date</Text>
              <DatePickerInput
                value={startDate}
                onChange={(date) => {
                  setStartDate(date ?? undefined);

                  if (date && endDate && dayjs(endDate).isBefore(dayjs(date), 'day')) {
                    setEndDate(date);
                  }
                }}
                {...commonDatePickerProps}
              />
            </ScrollView>

            <ScrollView contentContainerStyle={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Selected End Date</Text>
              <DatePickerInput
                value={endDate}
                onChange={(date) => {
                  setEndDate(date ?? undefined);
                }}
                validRange={{
                  startDate: startDate ?? minimumBookableDate,
                }}
                locale="en-GB"
                mode="outlined"
                inputMode="start"
                underlineColor="transparent"
                placeholder="DD/MM/YYYY"
                outlineStyle={styles.datePickerOutline}
                style={styles.datePickerInput}
              />
            </ScrollView>

          <PartialDayTimeSection
            isSingleDayBooking={isSingleDayBooking}
            isPartialDay={isPartialDay}
            setIsPartialDay={setIsPartialDay}
            setIsStartTimePickerVisible={setIsStartTimePickerVisible}
            setIsEndTimePickerVisible={setIsEndTimePickerVisible}
            startHours={startHours}
            startMinutes={startMinutes}
            endHours={endHours}
            endMinutes={endMinutes}
            formatTime={formatTime}
            workingHoursText={workingHoursText}
            styles={styles}
          />

            <ScrollView contentContainerStyle={styles.fieldWrapper}>
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
            </ScrollView>

            <ScrollView contentContainerStyle={styles.fieldWrapper}>
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
            </ScrollView>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </PaperModal>

        <LeaveTypePickerModal
            visible={isLeaveTypePickerVisible}
            onDismiss={closeLeaveTypePicker}
            leaveTypes={leaveTypes}
            selectedLeaveTypeId={selectedLeaveTypeId}
            setSelectedLeaveTypeId={setSelectedLeaveTypeId}
            styles={styles}
        />

        <TimePickerModal
          visible={isStartTimePickerVisible}
          onDismiss={() => setIsStartTimePickerVisible(false)}
          onConfirm={({ hours, minutes }) => {
            setIsStartTimePickerVisible(false);
            setStartHours(hours);
            setStartMinutes(minutes);
          }}
          hours={startHours}
          minutes={startMinutes}
          use24HourClock
          label="Select start time"
          cancelLabel="Cancel"
          confirmLabel="Ok"
        />

        <TimePickerModal
          visible={isEndTimePickerVisible}
          onDismiss={() => setIsEndTimePickerVisible(false)}
          onConfirm={({ hours, minutes }) => {
            setIsEndTimePickerVisible(false);
            setEndHours(hours);
            setEndMinutes(minutes);
        }}
          hours={endHours}
          minutes={endMinutes}
          use24HourClock
          label="Select end time"
          cancelLabel="Cancel"
          confirmLabel="Ok"
        />
      </Portal>
  );
}
