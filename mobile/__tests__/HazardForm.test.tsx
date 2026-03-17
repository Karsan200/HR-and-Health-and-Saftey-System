// File: __tests__/HazardForm.test.tsx
import React from 'react';
import { Text, Alert } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import HazardForm from '../src/screens/HazardForm';
import AuthenticationService from '../src/logic/AuthenticationService';

const imagePicker = require('react-native-image-picker');

// Mock AuthenticationService with a fetch mock
jest.mock('../src/logic/AuthenticationService', () => ({
    fetch: jest.fn(),
    refresh: jest.fn(),
}));

// Mock DatePickerInput so it sets a valid date
jest.mock('react-native-paper-dates', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        DatePickerInput: (props: any) => {
            React.useEffect(() => {
                if (typeof props.onChange === 'function') {
                    // call onChange after mount to simulate user picking today's date
                    props.onChange(new Date());
                }
            }, []);
            return React.createElement(Text, { testID: 'mock-date' }, 'DatePicker');
        },
    };
});

// Mock image picker
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn((options: any, cb: any) =>
        cb({
            assets: [
                { base64: 'AAA', fileName: 'img1.jpg', type: 'image/jpeg' },
                { base64: 'BBB', fileName: 'img2.jpg', type: 'image/jpeg' },
            ],
        })
    ),
}));

const mockFetch = AuthenticationService.fetch as jest.Mock;
const { launchImageLibrary } = require('react-native-image-picker') as {
    launchImageLibrary: jest.Mock;
};

//The Main Tests

describe('HazardForm', () => {
    let alertSpy: jest.SpyInstance;
    const dateModule = require('react-native-paper-dates');

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Spy on Alert.alert so tests can assert calls
        alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => null);
    });

    afterEach(() => {
        alertSpy.mockRestore();
    });

    // fill all required fields using placeholders from the component
    function fillRequiredFields() {
        fireEvent.changeText(
            screen.getByPlaceholderText('e.g. Warehouse Manual Handling'),
            'Test Title'
        );
        fireEvent.changeText(
            screen.getByPlaceholderText('Describe the hazards identified...'),
            'Hazard description'
        );
        fireEvent.changeText(
            screen.getByPlaceholderText('Identify who is at risk and how they might be harmed...'),
            'Who harmed'
        );
        fireEvent.changeText(
            screen.getByPlaceholderText('Describe current control measures in place...'),
            'Controls'
        );
        fireEvent.changeText(
            screen.getByPlaceholderText('Describe additional actions required...'),
            'Further actions'
        );
        fireEvent.changeText(
            screen.getByPlaceholderText('e.g. Safety Manager, etc...'),
            'Safety Manager'
        );
    }

    it('saves draft successfully when all required fields are provided', async () => {
        mockFetch.mockResolvedValue({ ok: true });

        render(<HazardForm />);

        fillRequiredFields();

        fireEvent.press(screen.getByText('Save Draft'));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
            expect(
                (Alert.alert as jest.Mock).mock.calls.some(call => call[0] === 'Draft Saved')
            ).toBe(true);
        });
    });

    it('shows submission failed when backend returns non-ok', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => 'server error',
        });

        render(<HazardForm />);

        fillRequiredFields();

        fireEvent.press(screen.getByText('Submit Hazard'));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
            expect(
                (Alert.alert as jest.Mock).mock.calls.some(call => call[0] === 'Submission failed')
            ).toBe(true);
        });
    });

    it('shows incomplete fields alert when saving draft with missing fields', async () => {
        render(<HazardForm />);

        fireEvent.press(screen.getByText('Save Draft'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalled();
            expect((Alert.alert as jest.Mock).mock.calls.some(c => c[0] === 'Incomplete fields')).toBe(true);
        });
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('shows submission failed when fetch throws an exception', async () => {
        mockFetch.mockRejectedValue(new Error('network'));

        render(<HazardForm />);

        fillRequiredFields();

        fireEvent.press(screen.getByText('Submit Hazard'));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
            expect((Alert.alert as jest.Mock).mock.calls.some(call => call[0] === 'Submission failed')).toBe(true);
        });
    });

    it('handles image picker didCancel and errorCode gracefully', async () => {
        // first call simulates didCancel
        imagePicker.launchImageLibrary.mockImplementationOnce((_opts: any, cb: any) => cb({ didCancel: true }));
        render(<HazardForm />);
        fireEvent.press(screen.getByText('Upload Photo'));
        // no photos should be selected
        await waitFor(() => {
            expect(screen.queryByText(/photo[s]? selected/)).toBeNull();
        });

        // next simulate an error code
        imagePicker.launchImageLibrary.mockImplementationOnce((_opts: any, cb: any) => cb({ errorCode: 'E_UNK', errorMessage: 'boom' }));
        fireEvent.press(screen.getByText('Upload Photo'));
        // still no photos and no crash (just ensure not throwing and not adding photos)
        await waitFor(() => {
            expect(screen.queryByText(/photo[s]? selected/)).toBeNull();
        });
    });
    it('calls onDone when user confirms successful submission', async () => {
        mockFetch.mockResolvedValue({ ok: true });
        const onDoneMock = jest.fn();

        render(<HazardForm onDone={onDoneMock} />);

        fillRequiredFields();

        fireEvent.press(screen.getByText('Submit Hazard'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalled();
        });

        // simulate pressing OK button in Alert
        const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
            c => c[0] === 'Submission Complete'
        );

        const okButton = alertCall?.[2]?.[0];
        okButton.onPress();

        expect(onDoneMock).toHaveBeenCalled();
    });

    it('does not open image library when max photos reached', async () => {
        render(<HazardForm />);

        // simulate selecting 5 photos
        launchImageLibrary.mockImplementation((_opts, cb) =>
            cb({
                assets: new Array(5).fill(0).map((_, i) => ({
                    base64: 'AAA',
                    fileName: `img${i}.jpg`,
                    type: 'image/jpeg',
                })),
            })
        );

        fireEvent.press(screen.getByText('Upload Photo'));

        await waitFor(() => {
            expect(screen.getByText('5 photos selected')).toBeTruthy();
        });

        // try uploading again
        fireEvent.press(screen.getByText('Upload Photo'));

        // should not call picker again
        expect(launchImageLibrary).toHaveBeenCalledTimes(1);
    });
    it('handles empty assets response gracefully', async () => {
        launchImageLibrary.mockImplementation((_opts, cb) =>
            cb({ assets: [] })
        );

        render(<HazardForm />);

        fireEvent.press(screen.getByText('Upload Photo'));

        await waitFor(() => {
            expect(screen.queryByText(/photo/)).toBeNull();
        });
    });
    it('shows error when date is in the past', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        jest.spyOn(dateModule, 'DatePickerInput').mockImplementation((props: any) => {
            React.useEffect(() => {
                props.onChange(pastDate);
            }, []);
            return <Text testID="mock-date">Date</Text>;
        });

        render(<HazardForm />);

        fillRequiredFields();

        fireEvent.press(screen.getByText('Submit Hazard'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalled();
        });

        expect((Alert.alert as jest.Mock).mock.calls.some(c =>
            c[0] === 'Incomplete fields'
        )).toBe(true);
    });

    it('toggles actionCompleted when the checkbox is pressed', async () => {
        render(<HazardForm />);

        const checkbox = screen.getByTestId('actionCompletedCheckbox');

        // initial state should be unchecked
        expect(checkbox.props.accessibilityState?.checked).toBe(false);

        // press to toggle on
        fireEvent.press(checkbox);
        await waitFor(() => {
            expect(screen.getByTestId('actionCompletedCheckbox').props.accessibilityState?.checked).toBe(true);
        });

        // press to toggle off
        fireEvent.press(screen.getByTestId('actionCompletedCheckbox'));
        await waitFor(() => {
            expect(screen.getByTestId('actionCompletedCheckbox').props.accessibilityState?.checked).toBe(false);
        });
    });

});


