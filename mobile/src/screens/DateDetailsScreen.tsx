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

type Props = {
  date: string | null;
};

type Activity = {
  name: string;
  role: string;
  until: string;
};

const DateDetailsScreen: React.FC<Props> = ({ date: initialDateStr }) => {
  const { theme, accessibility } = useContext(ThemeContext); // Get current theme
  const themedStyles = styles(theme, accessibility);

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
    <SafeAreaView style={themedStyles.container}>
      <ScrollView contentContainerStyle={themedStyles.content}>
        {/* Date Header */}
        <View style={themedStyles.dateHeader}>
          <Text style={themedStyles.dateText}>
            {selectedDate.format('D MMMM, YYYY')}
          </Text>

          {isToday && <Text style={themedStyles.todayText}>TODAY</Text>}
        </View>

        {/* Week Days Row */}
        <View style={themedStyles.weekRow}>
          {weekDays.map(day => {
            const selected = day.isSame(selectedDate, 'day');

            return (
              <TouchableOpacity
                key={day.format('YYYY-MM-DD')}
                style={[themedStyles.dayCard, selected && themedStyles.dayCardSelected]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[themedStyles.dayLabel, selected && themedStyles.dayLabelSelected]}
                >
                  {day.format('ddd').toUpperCase()}
                </Text>

                <Text
                  style={[
                    themedStyles.dayNumber,
                    selected && themedStyles.dayNumberSelected,
                  ]}
                >
                  {day.format('D')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Week Navigation Buttons */}
        <View style={themedStyles.weekNavButtons}>
          <TouchableOpacity
            style={themedStyles.weekButton}
            onPress={goToPreviousWeek}
          >
            <Text style={themedStyles.weekButtonText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity style={themedStyles.weekButton} onPress={goToNextWeek}>
            <Text style={themedStyles.weekButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Cards */}
        {activities.length === 0 && <Text style={{ color: theme.greyPrimaryMainText }}>No leave for this date</Text>}

        {activities.map((activity, index) => (
          <View key={index} style={themedStyles.activityCard}>
            <View style={themedStyles.activityRow}>
              <View style={themedStyles.activityTitle}>
                <View style={themedStyles.activityDot} />

                <View style={themedStyles.nameTag}>
                  <Text style={themedStyles.nameText}>
                    {activity.name} • {activity.role}
                  </Text>
                </View>
              </View>

              <Text style={themedStyles.activitySubtext}>
                On leave til {activity.until}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={themedStyles.addButton}>
        <Text style={themedStyles.addIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DateDetailsScreen;
