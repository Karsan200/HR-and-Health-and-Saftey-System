import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Summary Boxes */}
      <View style={styles.summaryContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Hours Left</Text>
          <Text style={styles.cardNumber}>82</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pending</Text>
          <Text style={styles.cardNumber}>4</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Approved</Text>
          <Text style={styles.cardNumber}>2</Text>
        </View>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#D20414',
            },
          }}
          theme={{
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#767676',
            selectedDayBackgroundColor: '#D20414',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#D20414',
            arrowColor: '#D20414',
            monthTextColor: '#000',
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8',
    paddingTop: 16,
  },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  cardLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },

  cardNumber: {
    fontSize: 26,
    fontWeight: '500',
    color: '#000',
  },

  calendarContainer: {
    marginHorizontal: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default CalendarScreen;


