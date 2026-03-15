import { AppSection, ScreenKey } from '../../logic/NavigationConfiguration.ts';
import React from 'react';

export type ScreenConfigProps = {
  section: AppSection;
  setSection: React.Dispatch<React.SetStateAction<AppSection>>;
  currentScreen: ScreenKey;
  setCurrentScreen: React.Dispatch<React.SetStateAction<ScreenKey>>;

  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
};