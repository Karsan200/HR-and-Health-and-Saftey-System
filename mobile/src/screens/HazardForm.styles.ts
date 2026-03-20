import { StyleSheet } from 'react-native';
import { FontSize, BorderRadius, TextStyles, Fonts } from '../theme/theme';

// styling for common fields like the text boxes
export const getCommonInputProps = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => ({
    mode: 'outlined' as const,
    dense: true,
    underlineColor: 'transparent',
    placeholderTextColor: theme.greyIconLight,
    contentStyle: { fontSize: FontSize.xs14 * (accessibility.largeText ? 1.3 : 1), padding: 5 },
    textColor: theme.black,
    outlineStyle: { borderRadius: BorderRadius.smallTextField },
    style: { backgroundColor: theme.white },
} as any);

//main styling fo the hazard form
export const styles = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {
  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({
        flexContainer: {
            flex: 1,
        },
        //main background
        container: {
            backgroundColor: theme.greyBackground,
            paddingTop: 24,
            paddingBottom: 48,
        },
        //gap between the sections
        spacer: {
            height: 4,
        },
        //the white background card
        card: {
            backgroundColor: theme.white,
            marginHorizontal: 16,
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            shadowColor: theme.greyIconLight,
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: {width: 0, height: 2},
            elevation: 4,
        },
        //the styling for the titles of the two cards
        cardTitle: {
            fontSize: FontSize.m20 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
            color: theme.black,
            marginBottom: 8,
        },
        //wrapper for label and required asterisk
        fieldRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
        },
        //label styling for the fields
        fieldLabel: {
            color: theme.greyPrimaryMainText,
            marginBottom: 6,
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
        },
        //asterisk styling
        required: {
            marginLeft: 4,
            color: theme.redTrafficPrimary,
        },

        //base styling for text boxes
        input: {
            backgroundColor: theme.white,
            marginBottom: 10,
            fontSize: FontSize.m20 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
        },
        //extra styling for multiline
        multiline: {
            minHeight: 80,
            paddingTop: 6,
            textAlignVertical: 'top',
        },
        // wrapper for checkbox and label
        checkboxRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 6,
            marginBottom: 8,
        },
        //checkbox label styling
        checkboxLabel: {
            color: theme.greyPrimaryMainText,
            marginLeft: 8,
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
        },
        //the submit button styling
        submitButton: {
            marginTop: 8,
        },
        //spacing at the bottom of the page so you can see the content behind the button action bar
        bottomSpacer: {
            height: 40,
        },
        //the upload button styling
        uploadButton: {
            marginTop: 8,
            marginBottom: 6,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            alignSelf: 'flex-start',
            paddingHorizontal: 0,
            backgroundColor: theme.redPrimary,
        },
        //the label inside the upload button styling
        uploadLabel: {
            fontSize: FontSize.xxs12 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
            color: theme.white,
        },

        //the text shat shows how many photos you have uploaded
        photoCountText: {
            marginTop: 6,
            color: theme.greyPrimaryMainText,
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,

        },
        //the error text telling you fields are required
        errorText: {
            color: theme.redTrafficPrimary,
            marginTop: 6,
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,

        },
      });
    };
