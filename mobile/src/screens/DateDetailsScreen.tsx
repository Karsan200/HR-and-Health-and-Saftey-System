import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import { dateDetailsStyles as styles } from './DateDetailsScreen.styles';
import AuthenticationService from "../logic/AuthenticationService.ts";

type Props = {
  date: string | null;
};

type Activity = {
  name: string;
  role: string;
  until: string;
};

const DateDetailsScreen: React.FC<Props> = ({ date: initialDateStr }) => {
  const initialDate = initialDateStr || dayjs().format('YYYY-MM-DD');

  const [selectedDate, setSelectedDate] = useState(dayjs(initialDate));
  const [activities, setActivities] = useState<Activity[]>([]);

  const startOfWeek = selectedDate.startOf('week');

  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    startOfWeek.add(i, 'day'),
  );

  const isToday = selectedDate.isSame(dayjs(), 'day');

  const fetchLeaveForDate = async (date: string) => {
    try {
      const response = await AuthenticationService.fetch(
        `http://10.0.2.2:8080/api/leave/day/${date}`, {}
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {selectedDate.format('D MMMM, YYYY')}
          </Text>

          {isToday && <Text style={styles.todayText}>TODAY</Text>}
        </View>

        {/* Week Days Row */}
        <View style={styles.weekRow}>
          {weekDays.map(day => {
            const selected = day.isSame(selectedDate, 'day');

            return (
              <TouchableOpacity
                key={day.format('YYYY-MM-DD')}
                style={[styles.dayCard, selected && styles.dayCardSelected]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[styles.dayLabel, selected && styles.dayLabelSelected]}
                >
                  {day.format('ddd').toUpperCase()}
                </Text>

                <Text
                  style={[
                    styles.dayNumber,
                    selected && styles.dayNumberSelected,
                  ]}
                >
                  {day.format('D')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Week Navigation Buttons */}
        <View style={styles.weekNavButtons}>
          <TouchableOpacity
            style={styles.weekButton}
            onPress={goToPreviousWeek}
          >
            <Text style={styles.weekButtonText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.weekButton} onPress={goToNextWeek}>
            <Text style={styles.weekButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Cards */}
        {activities.length === 0 && <Text>No leave for this date</Text>}

        {activities.map((activity, index) => (
          <View key={index} style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={styles.activityTitle}>
                <View style={styles.activityDot} />

                <View style={styles.nameTag}>
                  <Text style={styles.nameText}>
                    {activity.name} • {activity.role}
                  </Text>
                </View>
              </View>

              <Text style={styles.activitySubtext}>
                On leave til {activity.until}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DateDetailsScreen;
