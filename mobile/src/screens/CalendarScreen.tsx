import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import dayjs from 'dayjs';
import { Spacing, FontSize, BorderRadius, TextStyles } from '../theme/theme';
import { Colours } from '../theme/colours.ts';
import SummaryCard from '../Components/summary/SummaryCard.tsx';
import SummaryRow from '../Components/summary/SummaryRow.tsx';

const CalendarScreen: React.FC = () => {
  const today = dayjs();
  const bookedDays = ['2026-03-11', '2026-03-13', '2026-03-16']; // Example booked days

  // Greyed out dates (next 2 weeks)
  const greyedDates: Record<string, any> = {};
  for (let i = 1; i <= 14; i++) {
    const date = today.add(i, 'day').format('YYYY-MM-DD');
    greyedDates[date] = {
      selected: true,
      selectedColor: Colours.greyBackground,
      selectedTextColor: Colours.greyPrimaryMainText,
      customStyles: {
        container: { borderRadius: 20 },
        text: {
          color: Colours.greyPrimaryMainText,
          textAlign: 'center',
          lineHeight: 32,
        },
      },
      disabled: true,
      disableTouchEvent: true,
    };
  }

  // Booked days with solid red background
  const bookedDates: Record<string, any> = {};
  bookedDays.forEach(date => {
    bookedDates[date] = {
      selected: true,
      selectedColor: Colours.redPrimary,
      selectedTextColor: Colours.white,
      customStyles: {
        container: { borderRadius: 20 },
        text: {
          color: Colours.white,
          fontWeight: '600',
          textAlign: 'center',
          lineHeight: 32,
        },
      },
    };
  });

  // Today solid black
  const todayMarking: Record<string, any> = {
    [today.format('YYYY-MM-DD')]: {
      selected: true,
      selectedColor: Colours.black,
      selectedTextColor: Colours.white,
      customStyles: {
        container: { borderRadius: 20 },
        text: {
          color: Colours.white,
          fontWeight: '600',
          textAlign: 'center',
          lineHeight: 32,
        },
      },
    },
  };

  // Combine all markings
  const markedDates: Record<string, any> = {
    ...greyedDates,
    ...bookedDates,
    ...todayMarking,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Wrapper to add padding above summary */}
      <View style={styles.summaryWrapper}>
        <SummaryRow>
          <SummaryCard
            label="Hours"
            value={82}
            icon="clock-outline"
            colour="red"
          />
          <SummaryCard
            label="Pending"
            value={4}
            icon="alert-circle-outline"
            colour="amber"
          />
          <SummaryCard
            label="Approved"
            value={2}
            icon="check-circle-outline"
            colour="green"
          />
        </SummaryRow>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day: DateData) => {
            console.log('User pressed:', day.dateString);
          }}
          markedDates={markedDates}
          theme={{
            calendarBackground: Colours.white,
            textSectionTitleColor: Colours.greyPrimaryMainText,
            selectedDayBackgroundColor: Colours.redPrimary,
            selectedDayTextColor: Colours.white,
            todayTextColor: Colours.redPrimary,
            arrowColor: Colours.redPrimary,
            monthTextColor: Colours.black,
          }}
        />

        {/* Red stripe below top part */}
        <View style={styles.redStripe} />

        {/* Booked days key */}
        <View style={styles.bookedKey}>
          <View style={styles.bookedKeyCircle} />
          <Text style={styles.bookedKeyText}>Booked Days Off</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.greyBackground,
  },

  summaryWrapper: {
    paddingTop: Spacing.largePadding, // Space above summary boxes
    marginBottom: Spacing.largePadding, // Space between summary boxes and calendar
  },

  calendarContainer: {
    marginHorizontal: Spacing.largePadding,
    borderRadius: BorderRadius.largeButtonsAndOutlines,
    backgroundColor: Colours.white,
    padding: Spacing.smallPadding,
    shadowColor: Colours.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  redStripe: {
    height: 2,
    backgroundColor: Colours.redPrimary,
    marginVertical: 6,
    borderRadius: 1,
  },

  bookedKey: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingVertical: 10,
    gap: 10,
  },

  bookedKeyCircle: {
    width: 13,
    height: 13,
    backgroundColor: Colours.redPrimary,
    borderRadius: 100,
  },

  bookedKeyText: {
    ...TextStyles.regular,
    fontSize: FontSize.xs14,
    color: Colours.black,
  },
});
