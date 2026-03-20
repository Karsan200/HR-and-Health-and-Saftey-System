import {StyleSheet} from "react-native";
import { Fonts, FontSize, TextStyles } from '../theme/theme.ts';

export const ButtonActionBarStyles= (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {
  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({

        //root container that holds the entire action bar, positioned at the bottom of the screen
        container: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            elevation: 10,
            alignItems: 'center',
            overflow: 'visible',

        },
        // the card that contains the buttons
        card: {
            flexDirection: 'row',
            backgroundColor: theme.white,
            borderRadius: 0,
            paddingHorizontal: 12,
            paddingVertical: 12,
            minHeight: 80,
            width: '100%',
            shadowColor: theme.greyPrimaryMainText,
            shadowOpacity: 100,
            shadowRadius: 10,
            elevation: 10,
        },
        // the individual buttons, which will be flexed to fill the available space
        button: {
            flex: 1,
            marginHorizontal: 6,
        },
        //base styling of text inside buttons
        label: {
            fontSize: FontSize.s16 * fontScale,
            textAlignVertical: 'center',
            fontFamily: fontFamilies.medium,
            fontWeight: TextStyles.medium.fontWeight,

        },
        //submit button label
        primaryLabel: {
            color: theme.white,
        },
        //button content wrapper to center the text and control button height
        buttonContent: {
            height: 55,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 0,
        },
        // save button background colour
        saveButton: {
            backgroundColor: theme.white,
        },
        // submit button background colour
        submitButton: {
            backgroundColor: theme.redPrimary,
        },

        // save button label colour
        saveLabel: {
            color: theme.black,
        },
        // submit button label colour
        submitLabel: {
            color: theme.white,
        },
    });
}
