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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';

import { clockInScreenStyles as styles } from './ClockInScreen.styles';
import { ThemeContext } from '../theme/colourController';

// Types

type ClockEvent = {
  time: string; // e.g. "09:00"
  date: string; // e.g. "Friday, 30 January, 2026"
};

type ClockStats = {
  totalLates: number;
  onTimePercent: number;
  avgHoursPerDay: number;
  daysWorked: number;
};

// Component

const ClockInScreen: React.FC = () => {
  const { theme, accessibility } = useContext(ThemeContext);
  const themedStyles = styles(theme, accessibility);

  const [refreshing, setRefreshing] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const [lastClockIn, setLastClockIn] = useState<ClockEvent | null>(null);
  const [lastClockOut, setLastClockOut] = useState<ClockEvent | null>(null);
  const [stats] = useState<ClockStats>({
    totalLates: 2,
    onTimePercent: 95,
    avgHoursPerDay: 8.2,
    daysWorked: 5,
  });

  useEffect(() => {
    fetchClockStatus();
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchClockStatus(), fetchStats()]);
    setRefreshing(false);
  };

  // Placeholder API calls (wired up to Spring Boot in future)

  const fetchClockStatus = async () => {
    try {
      // const response = await AuthenticationService.fetch('/api/clock/status', {});
      // const data = await response.json();
      // setLastClockIn(data.lastClockIn);
      // setLastClockOut(data.lastClockOut);

      // Stub data
      setLastClockIn({ time: '09:00', date: 'Friday, 30 January, 2026' });
      setLastClockOut({ time: '17:30', date: 'Thursday, 29 January, 2026' });
    } catch (error) {
      console.error('Error fetching clock status', error);
    }
  };

  const fetchStats = async () => {
    try {
      // const response = await AuthenticationService.fetch('/api/clock/stats', {});
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      console.error('Error fetching stats', error);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim()) return;
    setReportSubmitting(true);
    try {
      // const response = await AuthenticationService.fetch('/api/clock/report', {
      //   method: 'POST',
      //   body: JSON.stringify({ issue: reportText }),
      // });
      setReportText('');
      setReportModalVisible(false);
    } catch (error) {
      console.error('Error submitting report', error);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Render

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
            {lastClockIn ? (
              <>
                <Text style={themedStyles.activityTime}>
                  {lastClockIn.time}
                </Text>
                <Text style={themedStyles.activityDate}>
                  {lastClockIn.date}
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
            {lastClockOut ? (
              <>
                <Text style={themedStyles.activityTime}>
                  {lastClockOut.time}
                </Text>
                <Text style={themedStyles.activityDate}>
                  {lastClockOut.date}
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
              {stats.totalLates}
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
              {stats.onTimePercent}%
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
              {stats.daysWorked}
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
              {stats.avgHoursPerDay}
            </Text>
          </View>
        </View>

        {/* Report Issue Button */}
        <TouchableOpacity
          style={themedStyles.reportButton}
          onPress={() => setReportModalVisible(true)}
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
        onRequestClose={() => setReportModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={themedStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={themedStyles.modalCard}>
            <View style={themedStyles.modalHeader}>
              <Text style={themedStyles.modalTitle}>Report an Issue</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Icon
                  source="close"
                  size={22}
                  color={theme.greyPrimaryMainText}
                />
              </TouchableOpacity>
            </View>

            <Text style={themedStyles.modalSubtitle}>
              Describe the issue with yesterday's clock-in record and a manager
              will review it.
            </Text>

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
                !reportText.trim() && themedStyles.modalSubmitButtonDisabled,
              ]}
              onPress={handleSubmitReport}
              activeOpacity={0.8}
              disabled={!reportText.trim() || reportSubmitting}
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
