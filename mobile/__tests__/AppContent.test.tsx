/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App.tsx';
import mockReact from 'react';
// Mocking safe area to prevent errors with missing native modules
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('react-native-background-actions', () => ({
  start: jest.fn(),
  isRunning: jest.fn().mockResolvedValue(true),
  stop: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  isEmulator: jest.fn().mockResolvedValue(false),
}));

jest.mock('munim-bluetooth', () => ({
  startAdvertising: jest.fn(),
  setServices: jest.fn(),
}));

jest.mock('../src/theme/paperTheme', () => ({
  paperTheme: () => ({}),
}));

jest.mock('../src/logic/AuthenticationService', () => ({
  refresh: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/screens/auth/PinCodeAuthScreen', () => {
  return { PinCodeAuthScreen: ({ isAuth }: any) => {
      mockReact.useEffect(() => { isAuth(false); }, [isAuth]);
      return null;
    }};
});

jest.mock('../src/screens/HsOverview', () => {
  const { View, Text } = require('react-native');

  return () => mockReact.createElement(View, null, mockReact.createElement(Text, null, 'Overview Screen'));
});

jest.mock('../src/screens/RiskAssessments', () => {
  const { View, Text } = require('react-native');
  return () => require('react').createElement(View, null,
      require('react').createElement(Text, null, 'Risk Assessments Screen')
  );
});

jest.mock('../src/screens/HazardForm', () => {
  const { View, Text } = require('react-native');
  return () => require('react').createElement(View, null,
      require('react').createElement(Text, null, 'Hazard Form Screen')
  );
});

jest.mock('../src/screens/PayslipScreen', () => {
  const { View, Text } = require('react-native');

  return () =>
      require('react').createElement(
          View,
          null,
          require('react').createElement(Text, null, 'Payslips Screen')
      );
});

jest.mock('../src/screens/HandbookScreen', () => {
  const { View, Text } = require('react-native');

  return () =>
      require('react').createElement(
          View,
          null,
          require('react').createElement(Text, null, 'Handbook Screen')
      );
});

jest.mock('../src/screens/DocumentsScreen', () => {
  const { View, Text } = require('react-native');

  return () =>
      require('react').createElement(
          View,
          null,
          require('react').createElement(Text, null, 'Documents Screen')
      );
});

jest.mock('../src/screens/PersonalScreen', () => {
  const { View, Text } = require('react-native');

  return () =>
      require('react').createElement(
          View,
          null,
          require('react').createElement(Text, null, 'Personal Screen')
      );
});

jest.mock('../src/screens/ClockInScreen', () => {
  const { View, Text } = require('react-native');
  return () =>
    require('react').createElement(
      View,
      null,
      require('react').createElement(Text, null, 'Clock-In Screen'),
    );
});

// Mocking HomeScreen to render the available buttons
jest.mock('../src/screens/HomeScreen', () => {
  const { View, Text } = require('react-native');

  return (props: any) =>
    mockReact.createElement(
      View,
      null,
      mockReact.createElement(Text, null, 'Welcome Back'),
      mockReact.createElement(Text, { onPress: props.onSelectHr }, 'HR Portal'),
      mockReact.createElement(Text, { onPress: props.onSelectHealthSafety }, 'Health & Safety'),
      mockReact.createElement(Text, { onPress: props.onSelectSettings }, 'Settings'),
      mockReact.createElement(Text, { onPress: props.onSelectLogout }, 'Logout'),
      mockReact.createElement(Text, { onPress: props.onSelectNotifications }, 'Notifications'),
      mockReact.createElement(Text, { onPress: props.onSelectProfile }, 'Profile'),
    );
});

// Mocking react-native-paper components used in the app
jest.mock('react-native-paper', () => {
  const { Text, View } = require('react-native');

  return {
    PaperProvider: ({ children }: { children: React.ReactNode }) => children,
    Icon: (props: any) => mockReact.createElement(Text, props, props.source || 'icon'),
    Avatar: {
      Icon: (props: any) => mockReact.createElement(View, props),
    },
    IconButton: (props: any) =>
        mockReact.createElement(Text, { onPress: props.onPress }, props.icon || 'icon-button'),
  };
});

// Mock ColorPicker to avoid Jest parsing JSX in node_modules
jest.mock('react-native-wheel-color-picker', () => {
  const { View } = require('react-native');

  return (props: any) => mockReact.createElement(View, props, null);
});

// Mock CalendarScreen to just render a placeholder
jest.mock('../src/screens/CalendarScreen', () => {
  const { View, Text } = require('react-native');

  return (props: any) =>
    mockReact.createElement(
      View,
      null,
      mockReact.createElement(Text, null, 'Calendar'),
      mockReact.createElement(Text, { onPress: () => props.onDayPress('2026-03-09') }, 'Open Date Details'),
    );
});

// Mocking DateDetailsScreen to render the selected date
jest.mock('../src/screens/DateDetailsScreen', () => {
  const { View, Text } = require('react-native');

  return (props: any) =>
    mockReact.createElement(View, null, mockReact.createElement(Text, null, `Date Details ${props.date}`));
});

// Mocking SettingsScreen to render a placeholder
jest.mock('../src/screens/personal/SettingsScreen', () => {
  const { View, Text } = require('react-native');

  return () => mockReact.createElement(View, null, mockReact.createElement(Text, null, 'Settings Screen'));
});

describe('App navigation flow', () => {
  it('starts on the home screen', async () => {
    const { getByText, queryByText } = render(<App />);

    // Wait for initial authentication check to complete and home screen to render
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // Ensuring the app opens on the HomeScreen by default
    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();

    // Ensuring portal navigation labels are not shown on the home screen
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Documents')).toBeNull();
  });

  it('opens HR section and shows the HR top and bottom navigation', async () => {
    const { getByText, getAllByText, queryByText } = render(<App />);

    // Wait for initial authentication check to complete and home screen to render
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // When the HR button is pressed
    fireEvent.press(getByText('HR Portal'));

    // Then the word calendar should appear in the top navbar and bottom navbar
    expect(getAllByText('Calendar')).toHaveLength(3);

    // Then the HR top navigation icons should be visible
    expect(getByText('bell')).toBeTruthy();

    // Then the HR bottom navigation items should be visible
    expect(getByText('Payslips')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Handbook')).toBeTruthy();
    expect(getByText('Clock-in')).toBeTruthy();

    // Ensuring health and safety items are not shown in the HR section
    expect(queryByText('Documents')).toBeNull();
    expect(queryByText('Overview')).toBeNull();
  });

  it('opens health and safety section and shows the health and safety top and bottom navigation', async () => {
    const { getByText, getAllByText, queryByText } = render(<App />);

    // Wait for initial authentication check to complete and home screen to render
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // When Health and Safety is pressed
    fireEvent.press(getByText('Health & Safety'));

    // Then Overview should appear in both the top nav and bottom nav
    expect(getAllByText('Overview')).toHaveLength(2);

    // Then the health and safety top navigation icons should be visible
    expect(getByText('bell')).toBeTruthy();

    // Then the health and safety bottom navigation items should be visible
    expect(getByText('Documents')).toBeTruthy();
    expect(getByText('Risk')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Personal')).toBeTruthy();

    // Ensuring HR items are not shown in the health and safety section
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Handbook')).toBeNull();
  });

  it('returns to the home screen when Home is pressed in the bottom nav', async () => {
    const { getByText, getAllByText, queryByText } = render(<App />);

    // Wait for initial authentication check to complete and home screen to render
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // Given the user has entered the HR section
    fireEvent.press(getByText('HR Portal'));
    expect(getAllByText('Calendar')).toHaveLength(3);

    // When Home is pressed in the bottom navigation
    fireEvent.press(getByText('Home'));

    // Then the user should be returned to the HomeScreen
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();

    // Ensuring the portal navigation is no longer shown
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Calendar')).toBeNull();
    expect(queryByText('Handbook')).toBeNull();
    expect(queryByText('Documents')).toBeNull();
  });

  it('opens date details when a date is pressed on the calendar screen', async () => {
    const { getByText } = render(<App />);

    // Given the user is on the home screen, and they click on the HR section
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('HR Portal'));

    // When a date is pressed on the calendar screen
    fireEvent.press(getByText('Open Date Details'));

    // Then the date details screen should be shown
    expect(getByText('Date Details 2026-03-09')).toBeTruthy();
  });

  it('returns to the calendar screen when Back is pressed on date details', async () => {
    const { getByText, queryByText, getAllByText } = render(<App />);

    // Given the user is on the home screen, and they click on the HR section and then a date on the calendar
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('HR Portal'));
    expect(getAllByText('Calendar')).toHaveLength(3);
    fireEvent.press(getByText('Open Date Details'));
    expect(getByText('Date Details 2026-03-09')).toBeTruthy();

    // When Back is pressed in the top navigation
    fireEvent.press(getByText('arrow-left'));

    // Then the user should be returned to the calendar screen
    expect(getAllByText('Calendar')).toHaveLength(3);
    expect(queryByText('Date Details 2026-03-09')).toBeNull();
  });

  it('opens settings from the home screen', async () => {
    const { getByText } = render(<App />);

    // Given the user is on the home screen, and they click on the settings section
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('Settings'));

    // Then the settings screen should be shown
    expect(getByText('Settings Screen')).toBeTruthy();
  });

  it('returns to the home screen when Back is pressed on settings', async () => {
    const { getByText, queryByText } = render(<App />);

    // Given the user is on the home screen, and they click on the settings section
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('Settings'));
    expect(getByText('Settings Screen')).toBeTruthy();

    // When Back is pressed in the top navigation
    fireEvent.press(getByText('arrow-left'));

    // Then the user should be returned to the HomeScreen
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();

    // Ensuring the settings page is no longer shown
    expect(queryByText('Settings Screen')).toBeNull();
  });

  it('opens the payslips screen from the HR bottom navigation', async () => {
    const { getByText, getAllByText } = render(<App />);

    // Given the user is on the home screen, and they click on the HR section
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('HR Portal'));

    // When Payslips is pressed in the bottom navigation
    fireEvent.press(getByText('Payslips'));

    // Then the payslips screen should be shown
    expect(getAllByText('Payslips')).toHaveLength(2);
  });

  it('opens the handbook screen from the HR bottom navigation', async () => {
    const { getByText, getAllByText } = render(<App />);

    // Given the user has entered the HR section
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('HR Portal'));

    // When Handbook is pressed in the bottom navigation
    fireEvent.press(getByText('Handbook'));

    // Then the handbook screen should be shown
    expect(getAllByText('Handbook')).toHaveLength(2);
  });

  it('opens the clock-in screen from the HR bottom navigation', async () => {
    const { getByText } = render(<App />);

    // Given the user has entered the HR section
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('HR Portal'));

    // When Clock-in is pressed in the bottom navigation
    fireEvent.press(getByText('Clock-in'));

    // Then the clock-in screen should be shown
    expect(getByText('Clock-In')).toBeTruthy();
    expect(getByText('Clock-In Screen')).toBeTruthy();
  });

  it('opens the documents screen from the health and safety bottom navigation', async () => {
    const { getAllByText } = render(<App />);

    // Given the user is on the home screen, and they click on the health and safety section
    await waitFor(() => {
      expect(getAllByText('Health & Safety')[0]).toBeTruthy();
    });
    fireEvent.press(getAllByText('Health & Safety')[0]);

    // When Documents is pressed in the bottom navigation
    fireEvent.press(getAllByText('Documents')[0]);

    // Then the documents screen should be shown
    expect(getAllByText('Documents')[0]).toBeTruthy();
  });

  it('opens the risk screen from the health and safety bottom navigation', async () => {
    const { getByText, getAllByText } = render(<App />);

    // Given the user is on the home screen, and they click on the health and safety section
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('Health & Safety'));

    // When Risk is pressed in the bottom navigation
    fireEvent.press(getByText('Risk'));

    // Then the risk screen should be shown
    expect(getAllByText('Risk')).toHaveLength(2);
  });

  it('opens the personal screen from the health and safety bottom navigation', async () => {
    const { getByText, getAllByText} = render(<App />);

    // Given the user is on the home screen, and they click on the health and safety section
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });
    fireEvent.press(getByText('Health & Safety'));

    // When Personal is pressed in the bottom navigation
    fireEvent.press(getByText('Personal'));

    // Then the personal screen should be shown
    expect(getAllByText('Personal')).toHaveLength(2);
  });

  it('opens logout from the home screen', async () => {
    const { getByText } = render(<App />);

    // Given the user is on the home screen
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // When Logout is pressed
    fireEvent.press(getByText('Logout'));

    // Then the logout screen should be shown
    expect(getByText('Logout')).toBeTruthy();
  });

  it('opens notifications from the home screen', async () => {
    const { getByText } = render(<App />);

    // Given the user is on the home screen
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // When notification button is pressed
    fireEvent.press(getByText('Notifications'));

    // Then the notifications screen should be shown
    expect(getByText('Notifications')).toBeTruthy();
  });

  it('opens profile from the home screen', async () => {
    const { getByText } = render(<App />);

    // Given the user is on the home screen
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
    });

    // When the profile option is pressed
    fireEvent.press(getByText('Profile'));

    // Then the profile screen should be shown
    expect(getByText('Profile')).toBeTruthy();
  });

});
