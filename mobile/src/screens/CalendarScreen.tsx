import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import dayjs from 'dayjs';

import { colours } from '../theme/colours';
import { calendarScreenStyles as styles } from './CalendarScreen.styles';
import SummaryCard from '../components/summary/SummaryCard';
import SummaryRow from '../components/summary/SummaryRow';
import AuthenticationService from "../logic/AuthenticationService.ts";

type Props = {
  onDayPress: (date: string) => void;
};

const CalendarScreen: React.FC<Props> = ({ onDayPress }) => {
  const today = dayjs();

  //TODO: allow admin to set this via desktop
  const MaxBookedDays = 2;

  const [bookedDays, setBookedDays] = useState<string[]>([]);

  useEffect(() => {
    fetchLeave();
  }, []);

  const fetchLeave = async () => {
    try {
      // Fetches default IP for emulator
      const response = await AuthenticationService.fetch('/api/leave/calendar', {});
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
      selectedColor: colours.greyBackground,
      selectedTextColor: colours.greyPrimaryMainText,
      customStyles: {
        container: { borderRadius: 20 },
        text: {
          color: colours.greyPrimaryMainText,
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
      selectedColor: fullyBooked ? colours.redPrimary : colours.amberPrimary,
      selectedTextColor: colours.white,
      customStyles: {
        container: { borderRadius: 20 },
        text: {
          color: colours.white,
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
      selectedColor: colours.black,
      selectedTextColor: colours.white,
      customStyles: {
        container: { borderRadius: 20 },
        text: {
          color: colours.white,
          fontWeight: '600',
          textAlign: 'center',
          lineHeight: 32,
        },
      },
    },
  };

  const markedDates = {
    ...greyedDates,
    ...bookedDates,
    ...todayMarking,
  };

  const handleDayPress = (day: DateData) => {
    onDayPress(day.dateString);
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
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            calendarBackground: colours.white,
            textSectionTitleColor: colours.greyPrimaryMainText,
            selectedDayBackgroundColor: colours.redPrimary,
            selectedDayTextColor: colours.white,
            todayTextColor: colours.redPrimary,
            arrowColor: colours.redPrimary,
            monthTextColor: colours.black,
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
