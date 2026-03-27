import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
    isSingleDayBooking: boolean;
    isPartialDay: boolean;
    setIsPartialDay: React.Dispatch<React.SetStateAction<boolean>>;
    setIsStartTimePickerVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEndTimePickerVisible: React.Dispatch<React.SetStateAction<boolean>>;
    startHours: number;
    startMinutes: number;
    endHours: number;
    endMinutes: number;
    formatTime: (hours: number, minutes: number) => string;
    workingHoursText: string;
    styles: any;
};

/**
 * Section used to allow the user to switch from full-day leave
 * to a partial-day booking and choose the leave hours.
 */
export default function PartialDayTimeSection({
                                                  isSingleDayBooking,
                                                  isPartialDay,
                                                  setIsPartialDay,
                                                  setIsStartTimePickerVisible,
                                                  setIsEndTimePickerVisible,
                                                  startHours,
                                                  startMinutes,
                                                  endHours,
                                                  endMinutes,
                                                  formatTime,
                                                  workingHoursText,
                                                  styles,
                                              }: Props) {
    if (!isSingleDayBooking) {
        return null;
    }

    return (
        <>
            <View style={styles.fieldWrapper}>
                <TouchableOpacity
                    style={styles.partialDayToggleRow}
                    onPress={() => setIsPartialDay((previousValue) => !previousValue)}
                    activeOpacity={0.8}
                >
                    <View style={styles.partialDayToggleTextWrapper}>
                        <Text style={styles.fieldLabel}>Select Specific Hours</Text>
                        <Text style={styles.secondaryText}>
                            Would you like to book off certain hours instead of the full day?
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.partialDayToggleIndicator,
                            isPartialDay && styles.partialDayToggleIndicatorSelected,
                        ]}
                    >
                        {isPartialDay ? (
                            <Text style={styles.partialDayToggleIndicatorText}>✓</Text>
                        ) : null}
                    </View>
                </TouchableOpacity>
            </View>

            {isPartialDay && (
                <View style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>Leave Hours</Text>

                    <View style={styles.timeRow}>
                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => setIsStartTimePickerVisible(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.timeButtonLabel}>Start Time</Text>
                            <Text style={styles.timeButtonValue}>
                                {formatTime(startHours, startMinutes)}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => setIsEndTimePickerVisible(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.timeButtonLabel}>End Time</Text>
                            <Text style={styles.timeButtonValue}>
                                {formatTime(endHours, endMinutes)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.secondaryText}>{workingHoursText}</Text>
                </View>
            )}
        </>
    );
}
