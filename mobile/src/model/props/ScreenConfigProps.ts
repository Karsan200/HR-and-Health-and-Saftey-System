import { AppSection, ScreenKey } from '../../logic/NavigationConfiguration.ts';
import React from 'react';

export type ScreenConfigProps = {
  section: AppSection;
  setSection: React.Dispatch<React.SetStateAction<AppSection>>;
  currentScreen: ScreenKey;
  setCurrentScreen: React.Dispatch<React.SetStateAction<ScreenKey>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;

  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
};