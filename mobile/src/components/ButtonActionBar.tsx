import React, { useContext } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemeContext } from '../theme/colourController.tsx';
import {Icon} from "react-native-paper/src";
import buttonActionBarStyles from "./ButtonActionBar.styles.ts";

type Props = {
    onSaveDraft: () => void;
    onSubmit: () => void;
};

export default function ButtonActionBar({ onSaveDraft, onSubmit }: Props) {
    const { theme } = useContext(ThemeContext);
    const styles = buttonActionBarStyles(theme);

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/*save as draft button*/}
            <View style={styles.card}>
                <Button
                    mode="outlined"
                    onPress={onSaveDraft}
                    icon={() => <Icon source="content-save-outline" size={20} color={theme.black} />}
                    style={styles.button}
                    labelStyle={[styles.label, styles.saveLabel]}
                    contentStyle={styles.buttonContent}
                >
                    Save Draft
                </Button>

                {/* submit button styling*/}
                <Button
                    mode="contained"
                    onPress={onSubmit}
                    style={styles.button}
                    labelStyle={[styles.label, styles.primaryLabel]}
                    contentStyle={styles.buttonContent}
                >
                    Submit Hazard
                </Button>
            </View>
        </View>
    );
}