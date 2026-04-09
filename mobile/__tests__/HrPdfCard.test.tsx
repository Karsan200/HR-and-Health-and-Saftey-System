/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HrPdfCard from '../src/components/HrPdfCard';
import { ThemeContext } from '../src/theme/colourController';

/**
 * Mock PDF component as a real component
 */
const MockPdf = (props: any) => {
    const React = require('react');
    return React.createElement('Pdf', props);
};

jest.mock('react-native-pdf', () => {
    return {
        __esModule: true,
        default: (props: any) => require('react').createElement(MockPdf, props),
    };
});

/**
 * Accessibility colour wheel
 */
jest.mock('react-native-wheel-color-picker', () => {
    return () => null;
});

/**
 * Mock Icon component
 */

jest.mock('react-native-paper', () => {
    const actual = jest.requireActual('react-native-paper');
    const React = require('react');

    return {
        ...actual,
        Icon: (props: any) => React.createElement('Icon', props),
    };
});

/**
 * Render helper
 */
const renderWithTheme = (ui: React.ReactElement) => {
    return render(
        <ThemeContext.Provider
            value={{
                theme: {} as any,
                accessibility: {} as any,
                updateAccessibility: jest.fn(),
                updateTheme: jest.fn(),
            }}
        >
            {ui}
        </ThemeContext.Provider>,
    );
};

describe('HrPdfCard', () => {
    const baseProps = {
        title: 'January 2026',
        subtitle: 'Pay Date: 31/01/2026',
        pdfUrl: 'https://test/jan.pdf',
        isExpanded: false,
        onPress: jest.fn(),
        onDownload: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Title + subtitle render
     */
    it('renders title and subtitle', () => {
        const { getByText } = renderWithTheme(<HrPdfCard {...baseProps} />);

        expect(getByText('January 2026')).toBeTruthy();
        expect(getByText('Pay Date: 31/01/2026')).toBeTruthy();
    });

    /**
     * P60 badge
     */
    it('renders P60 badge when isPSixty is true', () => {
        const { getByText } = renderWithTheme(
            <HrPdfCard {...baseProps} isPSixty />,
        );

        expect(getByText('P60')).toBeTruthy();
    });

    /**
     * Card press
     */
    it('calls onPress when card pressed', () => {
        const { getByText } = renderWithTheme(<HrPdfCard {...baseProps} />);

        fireEvent.press(getByText('January 2026'));

        expect(baseProps.onPress).toHaveBeenCalledTimes(1);
    });

    /**
     * PDF hidden when collapsed
     */
    it('does not render PDF when not expanded', () => {
        const { UNSAFE_queryByType } = renderWithTheme(
            <HrPdfCard {...baseProps} isExpanded={false} />,
        );

        expect(UNSAFE_queryByType(MockPdf)).toBeNull();
    });


    describe('HrPdfCard additional behaviors', () => {
        const baseProps = {
            title: 'January 2026',
            subtitle: 'Pay Date: 31/01/2026',
            pdfUrl: 'https://test/jan.pdf',
            isExpanded: true, // expanded so PDF renders
            onPress: jest.fn(),
            onDownload: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        /**
         * Download button press
         */
        it('calls onDownload when download icon pressed', () => {
            const {getByTestId} = renderWithTheme(
                <HrPdfCard {...baseProps} />,
            );

            // HrPdfCard should add a testID to the Pressable, e.g., "download-button"
            const downloadButton = getByTestId('download-button');
            const mockEvent = {stopPropagation: jest.fn()};

            fireEvent.press(downloadButton, mockEvent);

            expect(mockEvent.stopPropagation).toHaveBeenCalled();
            expect(baseProps.onDownload).toHaveBeenCalledTimes(1);
        });

        /**
         * PDF viewer mounts when expanded
         */
        it('renders Pdf component when isExpanded is true', () => {
            const { UNSAFE_queryByType } = renderWithTheme(
                <HrPdfCard {...baseProps} isExpanded={true} />
            );

            const pdfElement = UNSAFE_queryByType(MockPdf); // now works
            expect(pdfElement).not.toBeNull();
            expect(pdfElement?.props.source).toEqual({
                uri: baseProps.pdfUrl,
                cache: true,
            });
        });

        it('logs PDF errors to console.error', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const { UNSAFE_queryByType } = renderWithTheme(
                <HrPdfCard {...baseProps} isExpanded={true} />
            );

            // Find the Pdf component
            const pdfElement = UNSAFE_queryByType(MockPdf);
            expect(pdfElement).not.toBeNull();

            // Simulate an error
            const mockError = new Error('Failed to load PDF');
            pdfElement?.props.onError(mockError);

            // Assert console.error was called correctly
            expect(consoleSpy).toHaveBeenCalledWith('PDF error:', mockError);

            consoleSpy.mockRestore();
        });
    });
});