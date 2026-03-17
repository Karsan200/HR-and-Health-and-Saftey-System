import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ButtonActionBar from '../src/components/ButtonActionBar';

describe('ButtonActionBar', () => {

    /**
     * Renders both buttons
     */
    it('renders Save Draft and Submit buttons', () => {
        const { getByText } = render(
            <ButtonActionBar onSaveDraft={jest.fn()} onSubmit={jest.fn()} />
        );

        expect(getByText('Save Draft')).toBeTruthy();
        expect(getByText('Submit Hazard')).toBeTruthy();
    });

    /**
     * Calls onSaveDraft when pressed
     */
    it('calls onSaveDraft when Save Draft pressed', () => {
        const onSaveDraftMock = jest.fn();

        const { getByText } = render(
            <ButtonActionBar onSaveDraft={onSaveDraftMock} onSubmit={jest.fn()} />
        );

        fireEvent.press(getByText('Save Draft'));

        expect(onSaveDraftMock).toHaveBeenCalledTimes(1);
    });

    /**
     * Calls onSubmit when pressed
     */
    it('calls onSubmit when Submit pressed', () => {
        const onSubmitMock = jest.fn();

        const { getByText } = render(
            <ButtonActionBar onSaveDraft={jest.fn()} onSubmit={onSubmitMock} />
        );

        fireEvent.press(getByText('Submit Hazard'));

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

});
