import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import BottomNavBar from '../src/components/BottomNavBar';
import { bottomNavStyles } from '../src/components/BottomNavBar.styles';
import { getBottomNavItems, hrBottomNavItems, healthSafetyBottomNavItems } from '../src/logic/NavigationConfiguration';
import { colours } from '../src/theme/colours';

// Mocking react-native-paper components used in the BottomNavBar
jest.mock('react-native-paper', () => {
  const mockReact = require('react');
  const {Text} = require('react-native');

  return {
    Icon: (props: any) => mockReact.createElement(Text, props, 'icon'),
  };

});

describe('NavigationConfiguration', () => {
  it('returns HR items when section is hr', () => {
    // Given the section is set to hr
    // When getBottomNavItems is called
    const items = getBottomNavItems('hr');

    // Then the HR bottom navigation items should be returned
    expect(items).toEqual(hrBottomNavItems);
    expect(items).toHaveLength(5);
    expect(items.map(item => item.key)).toEqual([
      'payslips',
      'calendar',
      'home',
      'handbook',
      'clockIn',
    ]);
  });

  it('returns health and safety items when section is health-safety', () => {
    // Given the section is set to health-safety
    // When getBottomNavItems is called
    const items = getBottomNavItems('health-safety');

    // Then the health and safety bottom navigation items should be returned
    expect(items).toEqual(healthSafetyBottomNavItems);
    expect(items).toHaveLength(5);
    expect(items.map(item => item.key)).toEqual([
      'documents',
      'risk',
      'home',
      'overview',
      'personal',
    ]);
  });

  it('returns empty array when section is null', () => {
    // Expecting no bottom navbar if the page is not part of the HR or health and safety sections directly
    expect(getBottomNavItems(null)).toEqual([]);
  });
});


describe('BottomNavBar.styles', () => {
  it('uses the expected theme values', () => {
    const container = StyleSheet.flatten(bottomNavStyles.container);
    const navLabel = StyleSheet.flatten(bottomNavStyles.navLabel);
    const activeNavLabel = StyleSheet.flatten(bottomNavStyles.activeNavLabel);

    // Ensuring the styles are using the correct theme values and layout
    expect(container.flexDirection).toBe('row');
    expect(container.justifyContent).toBe('space-between');
    expect(container.backgroundColor).toBe(colours.white);
    expect(navLabel.fontSize).toBe(12);
    expect(navLabel.color).toBe(colours.greyPrimaryMainText);
    expect(navLabel.textAlign).toBe('center');
    expect(activeNavLabel.color).toBe(colours.redPrimary);
  });
});

describe('BottomNavBar component', () => {
  it('does not render when section is null', () => {

    // Ensuring the bottom navbar is not present when no section is selected
    const onNavigate = jest.fn();
    const { toJSON } = render(
        <BottomNavBar
            section={null}
            currentScreen="calendar"
            onNavigate={onNavigate}
        />
    );
    expect(toJSON()).toBeNull();
  });

  it('does not render when currentScreen is home', () => {
    // Ensuring the bottom navbar is not present on the home screen
    const onNavigate = jest.fn();
    const { toJSON } = render(
        <BottomNavBar
            section="hr"
            currentScreen="home"
            onNavigate={onNavigate}
        />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders HR items and navigates correctly', () => {
    // Given the section is hr and the current screen is calendar, When the BottomNavBar is rendered
    const onNavigate = jest.fn();
    const { getByText } = render(
        <BottomNavBar
            section="hr"
            currentScreen="calendar"
            onNavigate={onNavigate}
        />
    );

    // Then all HR navigation labels should be visible
    hrBottomNavItems.forEach(item => {
      expect(getByText(item.label)).toBeTruthy();
    });

    // Given the user presses Payslips
    fireEvent.press(getByText('Payslips'));

    // Then navigation should be called with payslips
    expect(onNavigate).toHaveBeenCalledWith('payslips');

    // When the user presses Calendar to return to the calendar screen
    fireEvent.press(getByText('Calendar'));

    // Then navigation should be called with calendar
    expect(onNavigate).toHaveBeenCalledWith('calendar');
  });

  it('renders health and safety items and navigates correctly', () => {
    // Given the section is health-safety and the current screen is overview, When the BottomNavBar is rendered
    const onNavigate = jest.fn();
    const { getByText } = render(
        <BottomNavBar
            section="health-safety"
            currentScreen="overview"
            onNavigate={onNavigate}
        />
    );

    // Then all health and safety navigation labels should be visible
    healthSafetyBottomNavItems.forEach(item => {
      expect(getByText(item.label)).toBeTruthy();
    });

    // When documents is pressed
    fireEvent.press(getByText('Documents'));

    // Then navigation should be called with documents
    expect(onNavigate).toHaveBeenCalledWith('documents');

    // When personal is pressed
    fireEvent.press(getByText('Personal'));

    // Then navigation should be called with personal
    expect(onNavigate).toHaveBeenCalledWith('personal');
  });

  it('applies active styling to the current screen label', () => {
    // Given the section is health-safety and the active screen is overview, When the BottomNavBar is rendered
    const onNavigate = jest.fn();
    const { getByText } = render(
        <BottomNavBar
            section="health-safety"
            currentScreen="overview"
            onNavigate={onNavigate}
        />
    );

    const activeLabel = getByText('Overview');
    const inactiveLabel = getByText('Documents');

    // When the active and inactive label styles are flattened
    const activeStyle = StyleSheet.flatten(activeLabel.props.style);
    const inactiveStyle = StyleSheet.flatten(inactiveLabel.props.style);

    // Then the active label should use the active colour
    expect(activeStyle.color).toBe(colours.redPrimary);

    // Then the inactive label should use the default colour
    expect(inactiveStyle.color).toBe(colours.greyPrimaryMainText);
  });
});
