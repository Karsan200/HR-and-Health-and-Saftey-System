import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Modal as PaperModal } from 'react-native-paper';
import { LeaveType } from '../logic/LeaveService';

type Props = {
    visible: boolean;
    onDismiss: () => void;
    leaveTypes: LeaveType[];
    selectedLeaveTypeId: number | null;
    setSelectedLeaveTypeId: (leaveTypeId: number) => void;
    styles: any;
};

/**
 * Modal used to select the leave type for the booking.
 */
export default function LeaveTypePickerModal({
                                                 visible,
                                                 onDismiss,
                                                 leaveTypes,
                                                 selectedLeaveTypeId,
                                                 setSelectedLeaveTypeId,
                                                 styles,
                                             }: Props) {
    return (
        <PaperModal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={styles.leaveTypeModalWrapper}
        >
            <View style={styles.leaveTypeModalContainer}>
                <View style={styles.leaveTypeHeaderRow}>
                    <Text style={styles.leaveTypeModalTitle}>Select Leave Type</Text>

                    <TouchableOpacity
                        onPress={onDismiss}
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
                                    onDismiss();
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
    );
}
