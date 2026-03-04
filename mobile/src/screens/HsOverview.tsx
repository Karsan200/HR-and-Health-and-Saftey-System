import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import SummaryRow from '../components/summary/SummaryRow';
import AlertBox from '../components/AlertBox';
import { styles, localStyles } from './HsOverview.styles';
import { Colours } from '../theme/colours';

// Props for the small summary component
interface HsStatProps {
  count: string | number;
  label: string;
}

// Small summary card showing a number and label
const HsStat: React.FC<HsStatProps> = ({ count, label }) => {
  return (
    <View style={localStyles.card}>
      <View style={localStyles.content}>
        <Text style={localStyles.count}>{count}</Text>
        <Text style={localStyles.label} numberOfLines={1} ellipsizeMode="tail">
          {label}
        </Text>
      </View>
    </View>
  );
};

// Quick Actions card that displays the Risk Assessment tile
const RiskCard: React.FC = () => {
  return (
    <View style={styles.riskWrapper}>
      <View style={localStyles.riskCard}>
        <View style={localStyles.iconBox}>
          <Icon source="clipboard-alert-outline" size={28} color={Colours.bluePrimary} />
        </View>
        <Text style={localStyles.riskLabel}>Risk Assessment</Text>
      </View>
    </View>
  );
};

// Main HsOverview screen component
export default function HsOverview() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Header row: icon + title + badge */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Icon source="alert-circle-outline" size={30} color={Colours.redPrimary} />
          <Text style={styles.headerTitle}>Actions Required</Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>3</Text>
        </View>
      </View>

      {/* Reusable alert component instances */}
      <View style={styles.alertWrapper}>
        <AlertBox
          label="Document"
          body="Fire and Safety Policy v2.0 requires a signature"
          circleColor={Colours.redPrimary}
          labelColor={Colours.redTextDark}
          labelBackground={Colours.redBackgroundLight}
        />
      </View>

      <View style={styles.alertWrapper}>
        <AlertBox
          label="Report"
          body="Hazard Report #HA-26-001 has been updated"
          circleColor={Colours.amberPrimary}
          labelColor={Colours.amberTextDark}
          labelBackground={Colours.amberBackgroundLight}
        />
      </View>

      <View style={styles.alertWrapper}>
        <AlertBox
          label="SOP"
          body="Filler text. dont know what to put here"
          circleColor={Colours.amberPrimary}
          labelColor={Colours.amberTextDark}
          labelBackground={Colours.amberBackgroundLight}
        />
      </View>

      {/* Quick Actions heading (same styling as header title) */}
      <View style={styles.riskHeadingWrapper}>
        <Text style={styles.sectionHeading}>Quick Actions</Text>
      </View>

      {/* Risk assessment quick action */}
      <RiskCard />

      {/* Summary stat cards row */}
      <View style={styles.cardsWrapper}>
        <SummaryRow>
          <HsStat count={5} label="Pending Docs" />
          <HsStat count={12} label="Signed" />
          <HsStat count={3} label="Hazards" />
        </SummaryRow>
      </View>
    </ScrollView>
  );
}
