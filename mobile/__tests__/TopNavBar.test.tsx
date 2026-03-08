import React from 'react';
import { StyleSheet } from 'react-native';
import TopNavBar from '../src/components/TopNavBar.tsx';
import { topNavStyles } from '../src/components/TopNavBar.styles';
import { Colours } from '../src/theme/colours';
import { fireEvent, render } from '@testing-library/react-native';

// Mocking react-native-paper components used in the TopNavBar
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Icon: (props: any) => React.createElement(Text, props, props.source || 'icon'),
  };
});

describe('TopNavBar.styles', () => {
  it('uses the expected theme values', () => {
    const container = StyleSheet.flatten(topNavStyles.container);
    const title = StyleSheet.flatten(topNavStyles.title);
    const rightSection = StyleSheet.flatten(topNavStyles.rightSection);
    const notificationBadge = StyleSheet.flatten(topNavStyles.notificationBadge);
    const notificationBadgeText = StyleSheet.flatten(topNavStyles.notificationBadgeText);

    // Ensuring the styles are using the correct theme values and layout
    expect(container.height).toBe(75);
    expect(container.flexDirection).toBe('row');
    expect(container.justifyContent).toBe('space-between');
    expect(container.alignItems).toBe('center');
    expect(container.backgroundColor).toBe(Colours.white);
    expect(title.color).toBe(Colours.black);
    expect(title.includeFontPadding).toBe(false);
    expect(title.textAlignVertical).toBe('center');
    expect(rightSection.justifyContent).toBe('flex-end');
    expect(notificationBadge.backgroundColor).toBe(Colours.redPrimary);
    expect(notificationBadgeText.color).toBe(Colours.white);
    expect(notificationBadgeText.textAlign).toBe('center');
  });
});

describe('TopNavBar component', () => {
  it('renders the title correctly', () => {
    // Given a title is passed into the TopNavBar, when the TopNavBar is rendered
    const { getByText } = render(<TopNavBar title="Risks" />);

    // Then the title should be visible
    expect(getByText('Risks')).toBeTruthy();
  });

  it('does not render the back button, when showBackButton is false', () => {
    // Given showBackButton is not enabledWhen the TopNavBar is rendered
    const { queryByText } = render(<TopNavBar title="Risks" />);

    // Then the back button icon should not be visible
    expect(queryByText('arrow-left')).toBeNull();
  });

  it('renders the back button when showBackButton is true', () => {
    // Given showBackButton is enabled, When the TopNavBar is rendered
    const { getByText } = render(
      <TopNavBar title="Settings" showBackButton={true} />
    );

    // Then the back button icon should be visible
    expect(getByText('arrow-left')).toBeTruthy();
  });

  it('calls onBackPress when the back button is pressed', () => {
    // Given the back button is visible and an onBackPress handler is provided
    const onBackPress = jest.fn();

    const { getByText } = render(
      <TopNavBar
        title="Settings"
        showBackButton={true}
        onBackPress={onBackPress}
      />
    );

    // When the back button is pressed
    fireEvent.press(getByText('arrow-left'));

    // Then the onBackPress handler should be called
    expect(onBackPress).toHaveBeenCalledTimes(1);
  });

  it('renders the notification bell, notification badge and profile icon', () => {
    // Given the TopNavBar is rendered, when the component loads
    const { getByText } = render(<TopNavBar title="Risks" />);

    // Then the notification bell, notification badge and profile icon should be visible
    expect(getByText('bell')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
    expect(getByText('account-circle')).toBeTruthy();
  });

  it('renders both left and right side content together', () => {
    // Given the TopNavBar is rendered with a back button, When the component loads
    const { getByText } = render(
      <TopNavBar title="Settings" showBackButton={true} />
    );

    // Then the left side content should be visible
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('arrow-left')).toBeTruthy();

    // Then the right side content should also be visible
    expect(getByText('bell')).toBeTruthy();
    expect(getByText('account-circle')).toBeTruthy();
  });
});