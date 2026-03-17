import React, {useContext, useMemo, useState} from 'react';
import {ScrollView, View, Text, Alert,} from 'react-native';

import {TextInput, Checkbox, Button} from 'react-native-paper';
import { ThemeContext } from '../theme/colourController.tsx';
import { FontSize, BorderRadius } from '../theme/theme';
import { JSX } from 'react/jsx-runtime';
import { DatePickerInput} from "react-native-paper-dates";
import ButtonActionBar from '../components/ButtonActionBar.tsx';
import {Icon} from "react-native-paper/src";
import {launchImageLibrary, ImageLibraryOptions} from 'react-native-image-picker';
import hazardStyles, {getCommonInputProps}  from './HazardForm.styles.ts';
import AuthenticationService from "../logic/AuthenticationService.ts";

type Props = {
    onDone?: () => void;
}

//represents the photo being uploaded from phones library
type Photo = {
    fileName?: string;
    type?: string;
    base64: string; // used to upload photo as base64 string to backend
}

export default function HazardForm({ onDone }: Props): JSX.Element {

    //form state for date and text fields and errors
    const { theme } = useContext(ThemeContext);
    const [inputDate, setInputDate] = React.useState<Date | undefined>(undefined);
    const [title, setTitle] = useState<string>('');
    const [hazardDesc, setHazardDesc] = useState<string>('');
    const [whoHarmed, setWhoHarmed] = useState<string>('');
    const [controlMeasures, setControlMeasures] = useState<string>('');
    const [furtherActions, setFurtherActions] = useState<string>('');
    const [whoAction, setWhoAction] = useState<string>('');
    const [actionCompleted, setActionCompleted] = useState<boolean>(false);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isDraft, setIsDraft] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({}); //validation error mapping

    //used to calculate the earliest date that can be selected in the date picker which is the same day
    const minDate = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    //helps format the date into what the backend is expecting (YYYY-MM-DDTHH:mm:00)
    const formatDate = (date?: Date) => {
        if (!date) return '';
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    }

    //Submit function which builds payload and POSTs to backend. Deals with regular submissions and drafts
    async function handleSubmit(draft?: boolean) {
        // determines if this is a draft or not
        const isDraftFlag = draft ?? isDraft;
        setIsDraft(isDraftFlag);

        //converts the selected photos into the format expected in the backend
        const files = photos.map((p, index) => {
            const nameParts = p.fileName?.split('.') ?? [];
            const extension = nameParts.length > 1 ? nameParts.pop() : 'jpg';

            return {
                name: nameParts.join('.') || `image-${index}`,
                extension: extension,
                content:p.base64
        };
        });

        //buids payload for backend submission
        const payload = {
            title,
            questionOne: hazardDesc,
            questionTwo: whoHarmed,
            questionThree: controlMeasures,
            questionFour: furtherActions,
            questionFive: whoAction,
            questionSix: inputDate ? inputDate.toISOString().slice(0, 19) : null, // backend expects ISO format without milliseconds
            isDraft: draft ?? isDraft,
            isCompleted: actionCompleted,
            files,
        };
        console.log('Payload:', payload);

        try {
            //using authentication service to make the POST request
            const response = await AuthenticationService.fetch('/api/hazard/report', {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify(payload),
            });

            // handles non-ok response by attempting to read error body and logging it, then showing a user-friendly alert
            if (!response.ok) {
                const body = await response.text().catch(() => ''); // attempt to read error body, ignore if fails
                console.error('Failed to submit hazard:', response.status, body);
                Alert.alert(
                    'Submission failed',
                    'An error occurred while submitting your hazard. Please try again later.',
                    [{text: 'OK'}],
                    {cancelable: true}
                );
                return;
            }

            // when successful it will notify the user
            Alert.alert(
                isDraftFlag ? 'Draft Saved' : 'Submission Complete',
                isDraftFlag ? 'Your draft has been saved.' : 'Your hazard has been submitted.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (onDone) onDone();
                        }
                    }
                ],
                {cancelable: true}
            );
        }catch (error) {
            //show error message if there is an unexpected error
            console.error('Error submitting hazard:', error);
            Alert.alert(
                'Submission failed',
                'An error occurred while submitting your hazard. Please try again later.',
                [{text: 'OK'}],
                {cancelable: true}
            );
        }
    }

    // handler for save draft button which validates and calls the submit handle as draft
    const handleSaveDraft= async () => {

        if (!validate()) {
            // show a popup alert when validation fails
            Alert.alert(
                'Incomplete fields',
                'Please complete all required fields before submitting.',
                [{text: 'OK'}],
                {cancelable: true}
            );
            return;
        }
        await handleSubmit(true); // true to indicate this is a draft
    };

    // handler for submit button which validates and calls the submit handle as a regular submission
    const handleSubmitPress = async () => {
        if (!validate()) {
            // show a popup alert when validation fails
            Alert.alert(
                'Incomplete fields',
                'Please complete all required fields before submitting.',
                [{ text: 'OK' }],
                { cancelable: true }
            );
            return;
        }
        await handleSubmit(false); // false to indicate this is a regular submission
    };

    //create styles with current theme
    const styles = hazardStyles(theme);
    const commonInputProps = getCommonInputProps(theme);


    const MAX_TOTAL = 5; // maximum images per hazard form

    const openImageLibrary = () => {
        const remaining = Math.max(MAX_TOTAL - photos.length, 0);
        if (remaining === 0) {
            console.log(`Maximum of ${MAX_TOTAL} images already selected.`);
            return;
        }

        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            selectionLimit: remaining,
            includeBase64: true, //using base64 to upload photos as strings to backend
        };

        // launching the image library and handling the response to extract selected photos and add them to state
        launchImageLibrary(options, (response) => {
            console.log('ImagePicker response:', response);

            if (response?.didCancel) {
                console.log('User cancelled image picker');
                return;
            }
            if (response?.errorCode) {
                console.log('ImagePicker Error:', response.errorMessage ?? response.errorCode);
                return;
            }

            const assets = response?.assets ?? [];
            if (assets.length === 0) {
                return;
            }

            // mapping the selected assets to the Photo format expected in state, using base64 for content and providing defaults for filename and type if missing
            const mapped = assets.map((a, i) => ({
                base64: a.base64 ?? '',
                fileName: a.fileName ?? `image-${i}.jpg`,
                type: a.type ?? 'image/jpeg',
            }));
            setPhotos(prev => [...prev, ...mapped]); // adding the newly selected photos to existing photos
        });
    };

    //remove error when user changes the text box/ date picker
    const clearError = (field: string) => {
        setErrors(prev => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };

    //validate required fields and date constraints
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        //validating that they are not empty
        if (!title || !title.trim()) newErrors.title = 'Required';
        if (!hazardDesc || !hazardDesc.trim()) newErrors.hazardDesc = 'Required';
        if (!whoHarmed || !whoHarmed.trim()) newErrors.whoHarmed = 'Required';
        if (!controlMeasures || !controlMeasures.trim()) newErrors.controlMeasures = 'Required';
        if (!furtherActions || !furtherActions.trim()) newErrors.furtherActions = 'Required';
        if (!whoAction || !whoAction.trim()) newErrors.whoAction = 'Required';

        if (!inputDate) {
            newErrors.inputDate = 'Required';
        } else {
            //making sure date is not in the past
            const selected = new Date(inputDate);
            selected.setHours(0, 0, 0, 0);
            if (selected < minDate) {
                newErrors.inputDate = 'Date cannot be in the past';
            }
        }
        setErrors(newErrors); // updating error state with any validation errors found
        return Object.keys(newErrors).length === 0;
    };

    //Rendering the forms UI
    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.spacer} />

                {/*Hazard Information Card*/}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Hazard Information</Text>

                    <Text style={styles.fieldLabel}>
                        Hazard Title
                        <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                        placeholder="e.g. Warehouse Manual Handling"
                        value={title}
                        onChangeText={setTitle}
                        {...commonInputProps}
                        multiline={false}
                        style={[styles.input]}
                        error={!!errors.title}

                    />
                    {/*checking for errors*/}
                    {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                </View>

                {/*Hazard Card. Main Form*/}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Hazard</Text>

                    {/*question 1*/}
                    <Text style={styles.fieldLabel}>
                        What are the hazards?
                        <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                        placeholder="Describe the hazards identified..."
                        value={hazardDesc}
                        onChangeText={setHazardDesc}
                        multiline
                        numberOfLines={4}
                        {...commonInputProps}
                        style={[styles.input, styles.multiline]}
                        error={!!errors.hazardDesc}
                    />
                    {errors.hazardDesc && <Text style={styles.errorText}>{errors.hazardDesc}</Text>}

                    {/*question 2*/}
                    <Text style={styles.fieldLabel}>
                        Who might be harmed and how?
                        <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                        placeholder="Identify who is at risk and how they might be harmed..."
                        value={whoHarmed}
                        onChangeText={setWhoHarmed}
                        multiline
                        numberOfLines={4}
                        {...commonInputProps}
                        style={[styles.input, styles.multiline]}
                        error={!!errors.whoHarmed}

                    />
                    {errors.whoHarmed && <Text style={styles.errorText}>{errors.whoHarmed}</Text>}

                    {/*question 3*/}
                    <Text style={styles.fieldLabel}>
                        What are you doing to control the risk?
                        <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                        placeholder="Describe current control measures in place..."
                        value={controlMeasures}
                        onChangeText={setControlMeasures}
                        multiline
                        numberOfLines={4}
                        {...commonInputProps}
                        style={[styles.input, styles.multiline]}
                        error={!!errors.controlMeasures}
                    />
                    {errors.controlMeasures && <Text style={styles.errorText}>{errors.controlMeasures}</Text>}

                    {/*question 4*/}
                    <Text style={styles.fieldLabel}>
                        What further actions do you need to take to control the risk?
                        <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                        placeholder="Describe additional actions required..."
                        value={furtherActions}
                        onChangeText={setFurtherActions}
                        multiline
                        numberOfLines={4}
                        {...commonInputProps}
                        style={[styles.input, styles.multiline]}
                        error={!!errors.furtherActions}
                    />
                    {errors.furtherActions && <Text style={styles.errorText}>{errors.furtherActions}</Text>}

                    {/*question 5*/}
                    <Text style={styles.fieldLabel}>
                        Who needs to carry out the action?
                        <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                        placeholder="e.g. Safety Manager, etc..."
                        value={whoAction}
                        onChangeText={setWhoAction}
                        {...commonInputProps}
                        multiline={false}
                        style={[styles.input]}
                        error={!!errors.whoAction}
                    />
                    {errors.whoAction && <Text style={styles.errorText}>{errors.whoAction}</Text>}

                    {/*question 6*/}
                    <Text style={styles.fieldLabel}>
                        When is the action needed by?
                        <Text style={styles.required}> *</Text>
                    </Text>

                    <DatePickerInput
                            locale="en-GB"
                            value={inputDate}
                            onChange={(d) => { setInputDate(d); clearError('inputDate'); }}
                            inputMode="start"
                            validRange={{ startDate: minDate }}
                            {...commonInputProps}
                            contentStyle={{ fontSize: FontSize.xs14 }}
                    />
                    {errors.inputDate && <Text style={styles.errorText}>{errors.inputDate}</Text>}

                    {/*upload a photo*/}
                    <Button
                        mode="outlined"
                        icon={() => <Icon source="upload" size={20} color={theme.white} />}
                        onPress={openImageLibrary}
                        buttonColor={theme.redPrimary}
                        textColor={theme.white}
                        style={styles.uploadButton}
                        labelStyle={styles.uploadLabel}
                    >
                        Upload Photo
                    </Button>

                    {photos.length > 0 && (
                        <Text style={styles.photoCountText}>
                            {photos.length} {photos.length === 1 ? 'photo' : 'photos'} selected
                        </Text>
                    )}

                    {/*action complete checkbox*/}
                    <View style={styles.checkboxRow}>
                        <Checkbox
                            status={actionCompleted ? 'checked' : 'unchecked'}
                            onPress={() => setActionCompleted(prev => !prev)}
                            color={theme.redPrimary}
                        />
                        <Text style={styles.checkboxLabel}>Action completed</Text>
                    </View>

                </View>

                <View style={styles.bottomSpacer} />
        </ScrollView>
            <ButtonActionBar
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmitPress}
                />
        </View>
    );
}