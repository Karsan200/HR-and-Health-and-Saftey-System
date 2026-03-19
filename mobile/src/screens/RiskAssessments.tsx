import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { passwordAuthScreenStyles as styles } from './auth/PasswordAuthScreen.styles.ts';
import { ThemeContext } from '../theme/colourController.tsx';
import { JSX } from 'react/jsx-runtime';

type RiskAssessmentsProps = {
    onStartAssessment: () => void;
};

export default function RiskAssessments({ onStartAssessment }: RiskAssessmentsProps): JSX.Element {
    const { theme } = useContext(ThemeContext);

    function handlePress() {
        onStartAssessment();
    }

    return (
        <View style={styles(theme).container}>
            <Text style={styles(theme).forgotPasswordText}>Risk Assessments</Text>

            <Button
                buttonColor={theme.redPrimary}
                textColor={theme.white}
                style={styles(theme).inputStyle}
                onPress={handlePress}
            >
                Start Assessment
            </Button>
        </View>
    );
}
