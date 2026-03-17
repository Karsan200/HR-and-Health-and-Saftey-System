import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import { dateDetailsStyles as styles } from './DateDetailsScreen.styles';
import AuthenticationService from "../logic/AuthenticationService";
import { ThemeContext } from '../theme/colourController';
import BookLeaveModal from './BookLeaveModal.tsx';

type Props = {
  date: string | null;
};

type Activity = {
  name: string;
  role: string;
  until: string;
};

const DateDetailsScreen: React.FC<Props> = ({ date: initialDateStr }) => {
  const { theme } = useContext(ThemeContext); // Get current theme

  const initialDate = initialDateStr || dayjs().format('YYYY-MM-DD');

  const [selectedDate, setSelectedDate] = useState(dayjs(initialDate));
  const [activities, setActivities] = useState<Activity[]>([]);

  const startOfWeek = selectedDate.startOf('week');

  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    startOfWeek.add(i, 'day'),
  );

  const isToday = selectedDate.isSame(dayjs(), 'day');
  const [isBookLeaveModalVisible, setIsBookLeaveModalVisible] = useState(false);
  const refreshSelectedDateData = async () => {
    await fetchLeaveForDate(selectedDate.format('YYYY-MM-DD'));
  };

  const DaysInAdvance = 14;
  const minimumBookableDate = dayjs()
    .add(DaysInAdvance, 'day').startOf('day');
  const canBookLeave = !selectedDate.isBefore(minimumBookableDate, 'day');

  const fetchLeaveForDate = async (date: string) => {
    try {
      const response = await AuthenticationService.fetch(
        `/api/leave/day/${date}`
      );

      if (!response.ok) {
        console.log('Leave fetch failed:', response.status);
        setActivities([]);
        return;
      }

      const text = await response.text();

      if (!text) {
        setActivities([]);
        return;
      }

      const data = JSON.parse(text);

      const mapped = data.map((leave: any) => ({
        name: leave.name,
        role: leave.role,
        until: dayjs(leave.endDate).format('DD/MM/YYYY'),
      }));

      setActivities(mapped);
    } catch (error) {
      console.error('Error fetching leave', error);
    }
  };

  useEffect(() => {
    fetchLeaveForDate(selectedDate.format('YYYY-MM-DD'));
  }, [selectedDate]);

  const goToPreviousWeek = () => {
    setSelectedDate(prev => prev.subtract(7, 'day'));
  };

  const goToNextWeek = () => {
    setSelectedDate(prev => prev.add(7, 'day'));
  };

  return (
    <SafeAreaView style={styles(theme).container}>
      <ScrollView contentContainerStyle={styles(theme).content}>
        {/* Date Header */}
        <View style={styles(theme).dateHeader}>
          <Text style={styles(theme).dateText}>
            {selectedDate.format('D MMMM, YYYY')}
          </Text>

          {isToday && <Text style={styles(theme).todayText}>TODAY</Text>}
        </View>

        {/* Week Days Row */}
        <View style={styles(theme).weekRow}>
          {weekDays.map(day => {
            const selected = day.isSame(selectedDate, 'day');

            return (
              <TouchableOpacity
                key={day.format('YYYY-MM-DD')}
                style={[styles(theme).dayCard, selected && styles(theme).dayCardSelected]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[styles(theme).dayLabel, selected && styles(theme).dayLabelSelected]}
                >
                  {day.format('ddd').toUpperCase()}
                </Text>

                <Text
                  style={[
                    styles(theme).dayNumber,
                    selected && styles(theme).dayNumberSelected,
                  ]}
                >
                  {day.format('D')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Week Navigation Buttons */}
        <View style={styles(theme).weekNavButtons}>
          <TouchableOpacity
            style={styles(theme).weekButton}
            onPress={goToPreviousWeek}
          >
            <Text style={styles(theme).weekButtonText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles(theme).weekButton} onPress={goToNextWeek}>
            <Text style={styles(theme).weekButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Cards */}
        {activities.length === 0 && <Text style={{ color: theme.greyPrimaryMainText }}>No leave for this date</Text>}

        {activities.map((activity, index) => (
          <View key={index} style={styles(theme).activityCard}>
            <View style={styles(theme).activityRow}>
              <View style={styles(theme).activityTitle}>
                <View style={styles(theme).activityDot} />

                <View style={styles(theme).nameTag}>
                  <Text style={styles(theme).nameText}>
                    {activity.name} • {activity.role}
                  </Text>
                </View>
              </View>

              <Text style={styles(theme).activitySubtext}>
                On leave til {activity.until}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[
          styles(theme).addButton,
          !canBookLeave && styles(theme).addButtonDisabled,
        ]}
        onPress={() => {
          if (canBookLeave) {
            setIsBookLeaveModalVisible(true);
          }
        }}
      >
        <Text style={styles(theme).addIcon}>+</Text>
      </TouchableOpacity>
      <BookLeaveModal
        visible={isBookLeaveModalVisible}
        initialDate={selectedDate.format('YYYY-MM-DD')}
        onClose={() => setIsBookLeaveModalVisible(false)}
        onSuccess={refreshSelectedDateData}
      />
    </SafeAreaView>
  );
};

export default DateDetailsScreen;
