import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import { Colours } from '../theme/colours';
import { Spacing, BorderRadius, FontSize, TextStyles } from '../theme/theme';

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
      const response = await fetch(
        `http://10.0.2.2:8080/api/leave/day/${date}`,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.greyBackground,
  },

  content: {
    paddingHorizontal: Spacing.largePadding,
    paddingTop: 40,
    paddingBottom: 120,
    gap: 20,
  },

  dateHeader: {
    gap: 8,
  },

  dateText: {
    ...TextStyles.regular,
    fontSize: 24,
    color: Colours.black,
  },

  todayText: {
    color: Colours.redPrimary,
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  weekNavButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },

  weekButton: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    backgroundColor: Colours.white,
    borderRadius: BorderRadius.largeButtonsAndOutlines,
    shadowColor: Colours.black,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  weekButtonText: {
    fontSize: 20,
    color: Colours.black,
  },

  dayCard: {
    width: 45,
    height: 70,
    borderRadius: BorderRadius.largeButtonsAndOutlines,
    backgroundColor: Colours.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colours.black,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  dayCardSelected: {
    backgroundColor: Colours.redPrimary,
  },

  dayLabel: {
    fontSize: FontSize.xs14,
    color: Colours.greyPrimaryMainText,
  },

  dayLabelSelected: {
    color: Colours.white,
  },

  dayNumber: {
    fontSize: 24,
    color: Colours.black,
  },

  dayNumberSelected: {
    color: Colours.white,
  },

  activityCard: {
    backgroundColor: Colours.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colours.black,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  activityRow: {
    gap: 10,
  },

  activityTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  activityDot: {
    width: 10,
    height: 10,
    backgroundColor: Colours.redPrimary,
    borderRadius: 10,
  },

  nameTag: {
    backgroundColor: Colours.redBackgroundLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  nameText: {
    color: Colours.redTextDark,
  },

  activitySubtext: {
    fontSize: FontSize.xs14,
    color: Colours.black,
    paddingLeft: 20,
  },

  addButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: Colours.redPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colours.white,
  },

  addIcon: {
    fontSize: 36,
    color: Colours.redPrimary,
    marginTop: -2,
  },
});
