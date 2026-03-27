import React, { useContext } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemeContext } from '../theme/colourController.tsx';
import {Icon} from "react-native-paper/src";
import { ButtonActionBarStyles as styles } from "./ButtonActionBar.styles.ts";

type Props = {
    onSaveDraft: () => void;
    onSubmit: () => void;
};

export default function ButtonActionBar({ onSaveDraft, onSubmit }: Props) {
    const { theme, accessibility } = useContext(ThemeContext);
    const themedStyles = styles(theme, accessibility);

    return (
        <View style={themedStyles.container} pointerEvents="box-none">
            {/*save as draft button*/}
            <View style={themedStyles.card}>
                <Button
                    mode="outlined"
                    onPress={onSaveDraft}
                    icon={() => <Icon source="content-save-outline" size={20} color={theme.black} />}
                    style={themedStyles.button}
                    labelStyle={[themedStyles.label, themedStyles.saveLabel]}
                    contentStyle={themedStyles.buttonContent}
                >
                    Save Draft
                </Button>

                {/* submit button styling*/}
                <Button
                    mode="contained"
                    onPress={onSubmit}
                    style={themedStyles.button}
                    labelStyle={[themedStyles.label, themedStyles.primaryLabel]}
                    contentStyle={themedStyles.buttonContent}
                >
                    Submit Hazard
                </Button>
            </View>
        </View>
    );
}