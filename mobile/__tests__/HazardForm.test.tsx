import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import HazardForm from '../src/screens/HazardForm';
import AuthenticationService from '../src/logic/AuthenticationService';
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemeContext } from '../src/theme/colourController';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../src/logic/AuthenticationService');
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn(),
}));
jest.mock('react-native-paper-dates', () => ({
    DatePickerInput: ({ onChange, value }: any) => {
        const { TextInput } = require('react-native');
        return (
            <TextInput
                testID="datePickerInput"
                value={value ? value.toISOString() : ''}
                onChangeText={(text: string) => onChange(text ? new Date(text) : undefined)}
            />
        );
    },
}));
jest.mock('../src/screens/HazardForm.styles.ts', () => ({
    __esModule: true,
    default: () => ({
        container: {},
        spacer: {},
        card: {},
        cardTitle: {},
        fieldLabel: {},
        required: {},
        input: {},
        multiline: {},
        errorText: {},
        checkboxRow: {},
        checkboxLabel: {},
        uploadButton: {},
        uploadLabel: {},
        photoCountText: {},
        bottomSpacer: {},
    }),
    getCommonInputProps: () => ({}),
}));
jest.mock('../src/components/ButtonActionBar.tsx', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ onSaveDraft, onSubmit }: any) => (
        <>
            <TouchableOpacity testID="saveDraftButton" onPress={onSaveDraft}>
                <Text>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="submitButton" onPress={onSubmit}>
                <Text>Submit</Text>
            </TouchableOpacity>
        </>
    );
});
jest.mock('../src/theme/theme', () => ({
    FontSize: { xs14: 14 },
    BorderRadius: { sm: 4 },
}));

// ─── Theme wrapper ────────────────────────────────────────────────────────────

const renderWithTheme = (ui: React.ReactElement) =>
    render(
        <ThemeContext.Provider value={{ theme: {} as any, updateTheme: () => {} }}>
            {ui}
        </ThemeContext.Provider>
    );

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TOMORROW = new Date();
TOMORROW.setDate(TOMORROW.getDate() + 1);
TOMORROW.setHours(0, 0, 0, 0);

const YESTERDAY = new Date();
YESTERDAY.setDate(YESTERDAY.getDate() - 1);
YESTERDAY.setHours(0, 0, 0, 0);

function fillAllFields(getByPlaceholderText: any, getByTestId: any) {
    fireEvent.changeText(getByPlaceholderText('e.g. Warehouse Manual Handling'), 'Test Title');
    fireEvent.changeText(getByPlaceholderText('Describe the hazards identified...'), 'Some hazard');
    fireEvent.changeText(getByPlaceholderText('Identify who is at risk and how they might be harmed...'), 'Workers');
    fireEvent.changeText(getByPlaceholderText('Describe current control measures in place...'), 'PPE required');
    fireEvent.changeText(getByPlaceholderText('Describe additional actions required...'), 'Training needed');
    fireEvent.changeText(getByPlaceholderText('e.g. Safety Manager, etc...'), 'Safety Manager');
    fireEvent.changeText(getByTestId('datePickerInput'), TOMORROW.toISOString());
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('HazardForm', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
    });

    // ── Rendering ────────────────────────────────────────────────────────────

    describe('Rendering', () => {
        it('renders all required field labels', () => {
            const { getByText } = renderWithTheme(<HazardForm />);
            expect(getByText('Hazard Title', { exact: false })).toBeTruthy();
            expect(getByText('What are the hazards?', { exact: false })).toBeTruthy();
            expect(getByText('Who might be harmed and how?', { exact: false })).toBeTruthy();
            expect(getByText('What are you doing to control the risk?', { exact: false })).toBeTruthy();
            expect(getByText('What further actions do you need to take to control the risk?', { exact: false })).toBeTruthy();
            expect(getByText('Who needs to carry out the action?', { exact: false })).toBeTruthy();
            expect(getByText('When is the action needed by?', { exact: false })).toBeTruthy();
        });

        it('renders the action completed checkbox unchecked by default', () => {
            const { getByTestId } = renderWithTheme(<HazardForm />);
            const checkbox = getByTestId('actionCompletedCheckbox');
            expect(checkbox.props.accessibilityState?.checked).toBeFalsy();
        });

        it('renders Save Draft and Submit buttons', () => {
            const { getByTestId } = renderWithTheme(<HazardForm />);
            expect(getByTestId('saveDraftButton')).toBeTruthy();
            expect(getByTestId('submitButton')).toBeTruthy();
        });

        it('does not show photo count text when no photos are selected', () => {
            const { queryByText } = renderWithTheme(<HazardForm />);
            expect(queryByText(/photos? selected/i)).toBeNull();
        });
    });

    // ── Validation ───────────────────────────────────────────────────────────

    describe('Validation', () => {
        it('shows Required errors for all empty fields on submit', async () => {
            const { getByTestId, getAllByText } = renderWithTheme(<HazardForm />);
            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });
            expect(getAllByText('Required').length).toBe(7);
        });

        it('shows alert when submitting with empty fields', async () => {
            const { getByTestId } = renderWithTheme(<HazardForm />);
            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });
            expect(Alert.alert).toHaveBeenCalledWith(
                'Incomplete fields',
                'Please complete all required fields before submitting.',
                expect.any(Array),
                expect.any(Object),
            );
        });

        it('shows alert when saving draft with empty fields', async () => {
            const { getByTestId } = renderWithTheme(<HazardForm />);
            await act(async () => {
                fireEvent.press(getByTestId('saveDraftButton'));
            });
            expect(Alert.alert).toHaveBeenCalledWith(
                'Incomplete fields',
                'Please complete all required fields before submitting.',
                expect.any(Array),
                expect.any(Object),
            );
        });

        it('shows a past-date error when the selected date is in the past', async () => {
            const { getByTestId, getByPlaceholderText, queryByText } = renderWithTheme(<HazardForm />);
            fireEvent.changeText(getByPlaceholderText('e.g. Warehouse Manual Handling'), 'Title');
            fireEvent.changeText(getByPlaceholderText('Describe the hazards identified...'), 'Hazard');
            fireEvent.changeText(getByPlaceholderText('Identify who is at risk and how they might be harmed...'), 'People');
            fireEvent.changeText(getByPlaceholderText('Describe current control measures in place...'), 'Controls');
            fireEvent.changeText(getByPlaceholderText('Describe additional actions required...'), 'Actions');
            fireEvent.changeText(getByPlaceholderText('e.g. Safety Manager, etc...'), 'Manager');
            fireEvent.changeText(getByTestId('datePickerInput'), YESTERDAY.toISOString());

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });
            expect(queryByText('Date cannot be in the past')).toBeTruthy();
        });

        it('clears a field error when the user updates that field', async () => {
            const { getByTestId, getByPlaceholderText, queryAllByText } = renderWithTheme(<HazardForm />);
            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });
            expect(queryAllByText('Required').length).toBeGreaterThan(0);
            fireEvent.changeText(getByPlaceholderText('e.g. Warehouse Manual Handling'), 'Fixed Title');
            expect(getByPlaceholderText('e.g. Warehouse Manual Handling').props.value).toBe('Fixed Title');
        });

        it('passes validation and calls the API when all fields are filled with a future date', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });
            expect(AuthenticationService.fetch).toHaveBeenCalledTimes(1);
        });
    });

    // ── Submission ───────────────────────────────────────────────────────────

    describe('Submission', () => {
        it('POSTs to /api/hazard/report with isDraft=false on regular submit', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });

            expect(AuthenticationService.fetch).toHaveBeenCalledWith(
                '/api/hazard/report',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"isDraft":false'),
                }),
            );
        });

        it('POSTs to /api/hazard/report with isDraft=true on save draft', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('saveDraftButton'));
            });

            expect(AuthenticationService.fetch).toHaveBeenCalledWith(
                '/api/hazard/report',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"isDraft":true'),
                }),
            );
        });

        it('shows success alert with correct message on regular submit', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Submission Complete',
                'Your hazard has been submitted.',
                expect.any(Array),
                expect.any(Object),
            );
        });

        it('shows draft saved alert with correct message on save draft', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('saveDraftButton'));
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Draft Saved',
                'Your draft has been saved.',
                expect.any(Array),
                expect.any(Object),
            );
        });

        it('does not throw when onDone is not provided after successful submission', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const okButton = alertCall[2][0];
            expect(() => act(() => { okButton.onPress(); })).not.toThrow();
        });

        it('calls onDone callback after successful submission', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const onDone = jest.fn();
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm onDone={onDone} />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const okButton = alertCall[2][0];
            act(() => { okButton.onPress(); });

            expect(onDone).toHaveBeenCalledTimes(1);
        });

        it('shows failure alert when the API returns a non-ok response', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 500,
                text: jest.fn().mockResolvedValue('Server error'),
            });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Submission failed',
                'An error occurred while submitting your hazard. Please try again later.',
                expect.any(Array),
                expect.any(Object),
            );
        });

        it('shows failure alert when the API call throws an error', async () => {
            (AuthenticationService.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });

            expect(Alert.alert).toHaveBeenCalledWith(
                'Submission failed',
                'An error occurred while submitting your hazard. Please try again later.',
                expect.any(Array),
                expect.any(Object),
            );
        });

        it('includes form field values in the submitted payload', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });

            const body = JSON.parse(
                (AuthenticationService.fetch as jest.Mock).mock.calls[0][1].body
            );
            expect(body.title).toBe('Test Title');
            expect(body.questionOne).toBe('Some hazard');
            expect(body.questionTwo).toBe('Workers');
            expect(body.questionThree).toBe('PPE required');
            expect(body.questionFour).toBe('Training needed');
            expect(body.questionFive).toBe('Safety Manager');
            expect(body.questionSix).toBeTruthy();
        });
    });

    // ── Checkbox ─────────────────────────────────────────────────────────────

    describe('Action Completed Checkbox', () => {
        it('toggles actionCompleted to true when pressed', () => {
            const { getByTestId } = renderWithTheme(<HazardForm />);
            const checkbox = getByTestId('actionCompletedCheckbox');
            fireEvent.press(checkbox);
            expect(checkbox.props.accessibilityState?.checked).toBe(true);
        });

        it('toggles actionCompleted back to false when pressed twice', () => {
            const { getByTestId } = renderWithTheme(<HazardForm />);
            const checkbox = getByTestId('actionCompletedCheckbox');
            fireEvent.press(checkbox);
            fireEvent.press(checkbox);
            expect(checkbox.props.accessibilityState?.checked).toBeFalsy();
        });

        it('includes isCompleted=true in the payload when checkbox is checked', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);
            fireEvent.press(getByTestId('actionCompletedCheckbox'));

            await act(async () => {
                fireEvent.press(getByTestId('submitButton'));
            });

            const body = JSON.parse(
                (AuthenticationService.fetch as jest.Mock).mock.calls[0][1].body
            );
            expect(body.isCompleted).toBe(true);
        });
    });

    // ── Image Picker ─────────────────────────────────────────────────────────

    describe('Image Picker', () => {
        it('shows photo count after selecting images', async () => {
            (launchImageLibrary as jest.Mock).mockImplementationOnce((_opts: any, cb: any) => {
                cb({
                    assets: [
                        { base64: 'abc123', fileName: 'photo1.jpg', type: 'image/jpeg' },
                        { base64: 'def456', fileName: 'photo2.jpg', type: 'image/jpeg' },
                    ],
                });
            });

            const { getByText } = renderWithTheme(<HazardForm />);
            await act(async () => {
                fireEvent.press(getByText('Upload Photo'));
            });

            expect(getByText('2 photos selected')).toBeTruthy();
        });

        it('shows singular "photo" when exactly one image is selected', async () => {
            (launchImageLibrary as jest.Mock).mockImplementationOnce((_opts: any, cb: any) => {
                cb({
                    assets: [{ base64: 'abc123', fileName: 'photo1.jpg', type: 'image/jpeg' }],
                });
            });

            const { getByText } = renderWithTheme(<HazardForm />);
            await act(async () => {
                fireEvent.press(getByText('Upload Photo'));
            });

            expect(getByText('1 photo selected')).toBeTruthy();
        });

        it('does not add photos when user cancels image picker', async () => {
            (launchImageLibrary as jest.Mock).mockImplementationOnce((_opts: any, cb: any) => {
                cb({ didCancel: true });
            });

            const { getByText, queryByText } = renderWithTheme(<HazardForm />);
            await act(async () => {
                fireEvent.press(getByText('Upload Photo'));
            });
            expect(queryByText(/photo selected/)).toBeNull();
        });

        it('does not open the picker when MAX_TOTAL images are already selected', async () => {
            (launchImageLibrary as jest.Mock).mockImplementationOnce((opts: any, cb: any) => {
                cb({
                    assets: Array.from({ length: opts.selectionLimit }, (_, i) => ({
                        base64: `b64-${i}`,
                        fileName: `photo${i}.jpg`,
                        type: 'image/jpeg',
                    })),
                });
            });

            const { getByText } = renderWithTheme(<HazardForm />);
            await act(async () => { fireEvent.press(getByText('Upload Photo')); });
            expect(getByText('5 photos selected')).toBeTruthy();

            await act(async () => { fireEvent.press(getByText('Upload Photo')); });
            expect(launchImageLibrary).toHaveBeenCalledTimes(1);
        });

        it('does not add photos when image picker returns an empty assets array', async () => {
            (launchImageLibrary as jest.Mock).mockImplementationOnce((_opts: any, cb: any) => {
                cb({ assets: [] });
            });

            const { getByText, queryByText } = renderWithTheme(<HazardForm />);
            await act(async () => { fireEvent.press(getByText('Upload Photo')); });
            expect(queryByText(/photo selected/)).toBeNull();
        });

        it('does not add photos when image picker returns an error code', async () => {
            (launchImageLibrary as jest.Mock).mockImplementationOnce((_opts: any, cb: any) => {
                cb({ errorCode: 'permission', errorMessage: 'Permission denied' });
            });

            const { getByText, queryByText } = renderWithTheme(<HazardForm />);
            await act(async () => { fireEvent.press(getByText('Upload Photo')); });
            expect(queryByText(/photo selected/)).toBeNull();
        });

        it('handles assets with missing base64, fileName and type gracefully', async () => {
            (launchImageLibrary as jest.Mock).mockImplementationOnce((_opts: any, cb: any) => {
                cb({
                    assets: [{ uri: 'file://some/path' }],
                });
            });

            const { getByText } = renderWithTheme(<HazardForm />);
            await act(async () => { fireEvent.press(getByText('Upload Photo')); });
            expect(getByText('1 photo selected')).toBeTruthy();
        });

        it('handles a filename with no extension when building the payload', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            (launchImageLibrary as jest.Mock).mockImplementationOnce((_opts: any, cb: any) => {
                cb({
                    assets: [{ base64: 'abc123', fileName: 'photowithoutext', type: 'image/jpeg' }],
                });
            });

            const { getByText, getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            await act(async () => { fireEvent.press(getByText('Upload Photo')); });
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => { fireEvent.press(getByTestId('submitButton')); });

            const body = JSON.parse(
                (AuthenticationService.fetch as jest.Mock).mock.calls[0][1].body
            );
            expect(body.files[0].name).toBe('photowithoutext');
            expect(body.files[0].extension).toBe('jpg');
        });

        it('includes photos as files in the submitted payload', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            (launchImageLibrary as jest.Mock).mockImplementationOnce((_opts: any, cb: any) => {
                cb({
                    assets: [{ base64: 'abc123', fileName: 'photo.jpg', type: 'image/jpeg' }],
                });
            });

            const { getByText, getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            await act(async () => { fireEvent.press(getByText('Upload Photo')); });
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => { fireEvent.press(getByTestId('submitButton')); });

            const body = JSON.parse(
                (AuthenticationService.fetch as jest.Mock).mock.calls[0][1].body
            );
            expect(body.files).toHaveLength(1);
            expect(body.files[0].content).toBe('abc123');
            expect(body.files[0].name).toBe('photo');
            expect(body.files[0].extension).toBe('jpg');
        });
    });

    // ── Date Formatting ──────────────────────────────────────────────────────

    describe('Date Formatting', () => {
        it('sends the date in ISO format without milliseconds (questionSix)', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);
            fillAllFields(getByPlaceholderText, getByTestId);

            await act(async () => { fireEvent.press(getByTestId('submitButton')); });

            const body = JSON.parse(
                (AuthenticationService.fetch as jest.Mock).mock.calls[0][1].body
            );
            expect(body.questionSix).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
        });

        it('blocks submission and does not call the API when date is missing', async () => {
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true });
            const { getByTestId, getByPlaceholderText } = renderWithTheme(<HazardForm />);

            fireEvent.changeText(getByPlaceholderText('e.g. Warehouse Manual Handling'), 'Test Title');
            fireEvent.changeText(getByPlaceholderText('Describe the hazards identified...'), 'Some hazard');
            fireEvent.changeText(getByPlaceholderText('Identify who is at risk and how they might be harmed...'), 'Workers');
            fireEvent.changeText(getByPlaceholderText('Describe current control measures in place...'), 'PPE required');
            fireEvent.changeText(getByPlaceholderText('Describe additional actions required...'), 'Training needed');
            fireEvent.changeText(getByPlaceholderText('e.g. Safety Manager, etc...'), 'Safety Manager');

            await act(async () => { fireEvent.press(getByTestId('submitButton')); });

            expect(AuthenticationService.fetch).not.toHaveBeenCalled();
        });
    });
});