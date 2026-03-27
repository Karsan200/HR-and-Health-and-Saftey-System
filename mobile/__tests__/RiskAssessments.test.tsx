// File: __tests__/RiskAssessments.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RiskAssessments from '../src/screens/RiskAssessments';

jest.mock('react-native-wheel-color-picker', () => {
  return () => null;
});

// Mock the ThemeContext
jest.mock('../src/theme/colourController.tsx', () => {
    const React = require('react');
    return {
        ThemeContext: React.createContext({ theme: {} }),
        ThemeProvider: ({ children }: any) => children,
    };
});

// Mock the styles module used by RiskAssessments
jest.mock('../src/screens/auth/PasswordAuthScreen.styles.ts', () => ({
    passwordAuthScreenStyles: () => ({
        container: {},
        forgotPasswordText: {},
        inputStyle: {},
    }),
}));

describe('RiskAssessments', () => {
    it('renders title and start button', () => {
        const { getByText } = render(<RiskAssessments onStartAssessment={() => {}} />);
        expect(getByText('Risk Assessments')).toBeTruthy();
        expect(getByText('Start Assessment')).toBeTruthy();
    });

    it('calls onStartAssessment when Start Assessment is pressed', () => {
        const onStart = jest.fn();
        const { getByText } = render(<RiskAssessments onStartAssessment={onStart} />);
        fireEvent.press(getByText('Start Assessment'));
        expect(onStart).toHaveBeenCalledTimes(1);
    });
});
