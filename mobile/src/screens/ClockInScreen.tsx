import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

import { clockInScreenStyles as styles } from './ClockInScreen.styles';
import { ThemeContext } from '../theme/colourController';
import AuthenticationService from '../logic/AuthenticationService';

// Types

type ClockStatus = {
  yesterdayClockIn: string | null;
  yesterdayClockOut: string | null;
  yesterdayDate: string;
  totalLates: number;
  onTimePercent: number;
  avgHoursPerDay: number;
  daysWorked: number;
};

type ClockRecord = {
  clockId: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  date: string;
};

// Component

const ClockInScreen: React.FC = () => {
  const { theme, accessibility } = useContext(ThemeContext);
  const themedStyles = styles(theme, accessibility);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [status, setStatus] = useState<ClockStatus | null>(null);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportRecords, setReportRecords] = useState<ClockRecord[]>([]);
  const [reportRecordsLoading, setReportRecordsLoading] = useState(false);
  const [selectedClockId, setSelectedClockId] = useState<string | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  };

  // API calls

  const fetchStatus = async () => {
    try {
      const response = await AuthenticationService.fetch(
        '/api/clock/status',
        {},
      );
      const data: ClockStatus = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching clock status', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRecords = async () => {
    setReportRecordsLoading(true);
    try {
      const response = await AuthenticationService.fetch(
        '/api/clock/records',
        {},
      );
      const data: ClockRecord[] = await response.json();
      setReportRecords(data);
      if (data.length > 0) {
        setSelectedClockId(data[0].clockId);
      }
    } catch (error) {
      console.error('Error fetching recent records', error);
    } finally {
      setReportRecordsLoading(false);
    }
  };

  const handleOpenReportModal = () => {
    fetchRecentRecords();
    setReportModalVisible(true);
  };

  const handleCloseReportModal = () => {
    setReportModalVisible(false);
    setReportText('');
    setSelectedClockId(null);
    setReportRecords([]);
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim() || !selectedClockId) return;
    setReportSubmitting(true);
    try {
      await AuthenticationService.fetch('/api/clock/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clockId: selectedClockId, issue: reportText }),
      });
      handleCloseReportModal();
    } catch (error) {
      console.error('Error submitting report', error);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Formats a ClockRecord into a readable dropdown label
  const formatRecordLabel = (record: ClockRecord): string => {
    const clockIn = record.clockInTime ?? '-';
    const clockOut = record.clockOutTime ?? '-';
    return `${record.date}  ${clockIn} – ${clockOut}`;
  };

  // Render

  if (loading) {
    return (
      <SafeAreaView style={themedStyles.container}>
        <View style={themedStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.redPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.redPrimary}
          />
        }
        contentContainerStyle={themedStyles.scrollContent}
      >
        {/* Yesterday's Activity */}
        <View style={themedStyles.activityCard}>
          <View style={themedStyles.activityHeader}>
            <Icon source="clock-outline" size={25} color={theme.redPrimary} />
            <Text style={themedStyles.activityTitle}>Yesterday's Activity</Text>
          </View>

          <View style={themedStyles.activityContent}>
            {/* Yesterday Clock In */}
            <Text style={themedStyles.activitySubLabel}>
              Yesterday Clock In
            </Text>
            {status?.yesterdayClockIn ? (
              <>
                <Text style={themedStyles.activityTime}>
                  {status.yesterdayClockIn}
                </Text>
                <Text style={themedStyles.activityDate}>
                  {status.yesterdayDate}
                </Text>
              </>
            ) : (
              <Text style={themedStyles.activityTime}>-</Text>
            )}

            <View style={themedStyles.divider} />

            {/* Yesterday Clock Out */}
            <Text style={themedStyles.activitySubLabel}>
              Yesterday Clock Out
            </Text>
            {status?.yesterdayClockOut ? (
              <>
                <Text style={themedStyles.activityTime}>
                  {status.yesterdayClockOut}
                </Text>
                <Text style={themedStyles.activityDate}>
                  {status.yesterdayDate}
                </Text>
              </>
            ) : (
              <Text style={themedStyles.activityTime}>-</Text>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={themedStyles.statsGrid}>
          {/* Total Lates */}
          <View style={themedStyles.statCard}>
            <View style={themedStyles.statHeader}>
              <View
                style={[themedStyles.statIconBg, themedStyles.statIconBgRed]}
              >
                <Icon
                  source="alert-circle-outline"
                  size={20}
                  color={theme.redPrimary}
                />
              </View>
              <Text style={themedStyles.statLabel}>Total Lates</Text>
            </View>
            <Text style={[themedStyles.statValue, themedStyles.statValueRed]}>
              {status?.totalLates ?? '-'}
            </Text>
          </View>

          {/* On Time */}
          <View style={themedStyles.statCard}>
            <View style={themedStyles.statHeader}>
              <View
                style={[themedStyles.statIconBg, themedStyles.statIconBgGreen]}
              >
                <Icon
                  source="trending-up"
                  size={20}
                  color={theme.greenPrimary}
                />
              </View>
              <Text style={themedStyles.statLabel}>On Time</Text>
            </View>
            <Text style={[themedStyles.statValue, themedStyles.statValueGreen]}>
              {status != null ? `${status.onTimePercent}%` : '-'}
            </Text>
          </View>

          {/* Days Worked */}
          <View style={themedStyles.statCard}>
            <View style={themedStyles.statHeader}>
              <View
                style={[themedStyles.statIconBg, themedStyles.statIconBgGrey]}
              >
                <Icon
                  source="calendar-outline"
                  size={20}
                  color={theme.greyPrimaryMainText}
                />
              </View>
              <Text style={themedStyles.statLabel}>Days Worked</Text>
            </View>
            <Text
              style={[themedStyles.statValue, themedStyles.statValueDefault]}
            >
              {status?.daysWorked ?? '-'}
            </Text>
          </View>

          {/* Avg Hours */}
          <View style={themedStyles.statCard}>
            <View style={themedStyles.statHeader}>
              <View
                style={[themedStyles.statIconBg, themedStyles.statIconBgGrey]}
              >
                <Icon
                  source="clock-outline"
                  size={20}
                  color={theme.greyPrimaryMainText}
                />
              </View>
              <Text style={themedStyles.statLabel}>Avg Hrs/Day</Text>
            </View>
            <Text
              style={[themedStyles.statValue, themedStyles.statValueDefault]}
            >
              {status?.avgHoursPerDay ?? '-'}
            </Text>
          </View>
        </View>

        {/* Report Issue Button */}
        <TouchableOpacity
          style={themedStyles.reportButton}
          onPress={handleOpenReportModal}
          activeOpacity={0.8}
        >
          <Icon source="flag-outline" size={20} color={theme.redPrimary} />
          <Text style={themedStyles.reportButtonText}>
            Report a Clock-In Issue
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Report Issue Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseReportModal}
      >
        <KeyboardAvoidingView
          style={themedStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={themedStyles.modalCard}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Report an Issue</Text>
              <TouchableOpacity onPress={handleCloseReportModal}>
                <Icon
                  source="close"
                  size={22}
                  color={theme.greyPrimaryMainText}
                />
              </TouchableOpacity>
            </View>

            <Text style={themedStyles.modalSubtitle}>
              Select the clock-in record you believe is incorrect, describe the
              issue, and a manager will review it.
            </Text>

            {/* Clock-in record picker */}
            <View style={themedStyles.pickerWrapper}>
              {reportRecordsLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.redPrimary}
                  style={themedStyles.pickerLoader}
                />
              ) : reportRecords.length === 0 ? (
                <Text style={themedStyles.pickerEmptyText}>
                  No records found.
                </Text>
              ) : (
                <Picker
                  selectedValue={selectedClockId}
                  onValueChange={value => setSelectedClockId(value)}
                  style={themedStyles.picker}
                  dropdownIconColor={theme.greyPrimaryMainText}
                >
                  {reportRecords.map(record => (
                    <Picker.Item
                      key={record.clockId}
                      label={formatRecordLabel(record)}
                      value={record.clockId}
                    />
                  ))}
                </Picker>
              )}
            </View>

            <TextInput
              style={themedStyles.modalInput}
              placeholder="e.g. I was clocked in late but I arrived on time..."
              placeholderTextColor={theme.greyIconLight}
              value={reportText}
              onChangeText={setReportText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                themedStyles.modalSubmitButton,
                (!reportText.trim() || !selectedClockId) &&
                  themedStyles.modalSubmitButtonDisabled,
              ]}
              onPress={handleSubmitReport}
              activeOpacity={0.8}
              disabled={
                !reportText.trim() || !selectedClockId || reportSubmitting
              }
            >
              <Text style={themedStyles.modalSubmitText}>
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default ClockInScreen;
