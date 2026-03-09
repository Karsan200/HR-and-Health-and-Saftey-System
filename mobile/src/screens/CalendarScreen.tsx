import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import dayjs from 'dayjs';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

import { Spacing, FontSize, BorderRadius, TextStyles } from '../theme/theme';
import { Colours } from '../theme/colours';
import SummaryCard from '../components/summary/SummaryCard';
import SummaryRow from '../components/summary/SummaryRow';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const today = dayjs();

  //TODO: allow admin to set this via desktop
  const MaxBookedDays = 2;

  const [bookedDays, setBookedDays] = useState<string[]>([]);

  useEffect(() => {
    fetchLeave();
  }, []);

  const fetchLeave = async () => {
    try {
      // Fetches default IP for emulator TODO: Change this to use AppSettings
      const response = await fetch('http://10.0.2.2:8080/api/leave/calendar');
      const data = await response.json();

      const dates: string[] = [];

      data.forEach((leave: any) => {
        let current = dayjs(leave.startDate);
        const end = dayjs(leave.endDate);

        while (current.isBefore(end) || current.isSame(end, 'day')) {
          dates.push(current.format('YYYY-MM-DD'));
          current = current.add(1, 'day');
        }
      });

      setBookedDays(dates);
    } catch (error) {
      console.error('Error fetching leave', error);
    }
  };

  // Count bookings per date
  const bookingCount: Record<string, number> = {};

  bookedDays.forEach(date => {
    bookingCount[date] = (bookingCount[date] || 0) + 1;
  });

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

  // Booked days logic
  const bookedDates: Record<string, any> = {};

  Object.entries(bookingCount).forEach(([date, count]) => {
    const fullyBooked = count >= MaxBookedDays;

    bookedDates[date] = {
      selected: true,
      selectedColor: fullyBooked ? Colours.redPrimary : Colours.amberPrimary,
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

  // Today
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

  const markedDates: Record<string, any> = {
    ...greyedDates,
    ...bookedDates,
    ...todayMarking,
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day: DateData) => {
            navigation.navigate('DayDetails', {
              date: day.dateString,
            });
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

        <View style={styles.redStripe} />

        {/* Key */}
        <View style={styles.keyContainer}>
          <View style={styles.keyItem}>
            <View style={styles.fullyBookedCircle} />
            <Text style={styles.keyText}>Fully Booked Days</Text>
          </View>

          <View style={styles.keyItem}>
            <View style={styles.partialBookedCircle} />
            <Text style={styles.keyText}>Partial Booked Days</Text>
          </View>
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
    paddingTop: Spacing.largePadding,
    marginBottom: Spacing.largePadding,
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

  keyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 10,
  },

  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  fullyBookedCircle: {
    width: 13,
    height: 13,
    backgroundColor: Colours.redPrimary,
    borderRadius: 100,
  },

  partialBookedCircle: {
    width: 13,
    height: 13,
    backgroundColor: Colours.amberPrimary,
    borderRadius: 100,
  },

  keyText: {
    ...TextStyles.regular,
    fontSize: FontSize.xs14,
    color: Colours.black,
  },
});
