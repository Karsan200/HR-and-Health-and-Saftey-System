import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import {Spacing, FontSize, BorderRadius, TextStyles,} from '../theme/theme';
import {Colours} from "../theme/colours.ts";
import SummaryCard from "../Components/Summary/SummaryCard.tsx";
import SummaryRow from "../Components/Summary/SummaryRow.tsx";

const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Summary Boxes */}
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

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: Colours.redPrimary,
            },
          }}
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

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.largePadding,
    marginBottom: Spacing.mediumPadding,
  },

  card: {
    flex: 1,
    backgroundColor: Colours.white,
    marginHorizontal: 6,
    borderRadius: BorderRadius.largeButtonsAndOutlines,
    paddingVertical: Spacing.mediumPadding,
    alignItems: 'center',
    shadowColor: Colours.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  cardLabel: {
    ...TextStyles.regular,
    fontSize: FontSize.xs14,
    color: Colours.greyIconLight,
    marginBottom: Spacing.smallPadding,
  },

  cardNumber: {
    ...TextStyles.medium,
    fontSize: FontSize.l24,
    color: Colours.black,
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
});
