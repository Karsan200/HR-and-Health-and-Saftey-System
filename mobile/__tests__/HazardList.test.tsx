import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HazardList from '../src/screens/HazardList';
import AuthenticationService from '../src/logic/AuthenticationService';
import { ThemeContext } from '../src/theme/colourController';

jest.mock('../src/logic/AuthenticationService');

jest.mock('../src/components/RiskCard', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ title, onPress }: any) => (
        <TouchableOpacity onPress={onPress} testID={`risk-${title}`}>
            <Text>{title}</Text>
        </TouchableOpacity>
    );
});

jest.mock('react-native-wheel-color-picker', () => {
    return () => null;
});

jest.mock('../src/components/summary/SummaryRow.tsx', () => {
    const { View } = require('react-native');
    return ({ children }: any) => <View>{children}</View>;
});

jest.mock('../src/components/summary/SummaryCard.tsx', () => {
    const { Text } = require('react-native');
    return ({ label, value }: any) => (
        <Text>{`${label}:${value}`}</Text>
    );
});

jest.mock('../src/components/FilterPills.tsx', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ options, onSelect }: any) => (
        <>
            {options.map((o: any) => (
                <TouchableOpacity
                    key={o.key}
                    onPress={() => onSelect(o.key)}
                    testID={`filter-${o.key}`}
                >
                    <Text>{o.label}</Text>
                </TouchableOpacity>
            ))}
        </>
    );
});

jest.mock('../src/screens/HazardForm.tsx', () => {
    const { Text } = require('react-native');
    return ({ hazardId }: any) => <Text testID="hazard-form">{hazardId}</Text>;
});

jest.mock('../src/screens/HazardForm.tsx', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return ({ hazardId, onDone }: any) => (
        <>
            <Text testID="hazard-form">{hazardId}</Text>
            <TouchableOpacity testID="done-button" onPress={onDone}>
                <Text>Done</Text>
            </TouchableOpacity>
        </>
    );
});

const renderWithTheme = (ui: React.ReactElement) =>
    render(
        <ThemeContext.Provider
            value={{
                theme: { redPrimary: 'red' } as any,
                accessibility: {} as any,
                updateTheme: () => {},
                updateAccessibility: () => {},
            }}
        >
            {ui}
        </ThemeContext.Provider>
    );

const mockHazards = [
    {
        hazardId: 1,
        title: 'Draft Hazard',
        createdBy: 'Alice',
        draft: true,
        closed: false,
        created: '2024-01-01T00:00:00Z',
        ownedByCurrentUser: true,
    },
    {
        hazardId: 2,
        title: 'Submitted Hazard',
        createdBy: 'Bob',
        draft: false,
        closed: false,
        created: '2024-01-02T00:00:00Z',
        ownedByCurrentUser: false,
    },
    {
        hazardId: 3,
        title: 'Closed Hazard',
        createdBy: 'Charlie',
        draft: false,
        closed: true,
        created: '2024-01-03T00:00:00Z',
        ownedByCurrentUser: false,
    },
];

describe('HazardList', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows error when fetch fails', async () => {

        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: false,
        });

        const { getByText } = renderWithTheme(
            <HazardList
                riskAssessmentId={1}
                riskAssessmentTitle="Test Assessment"
                onViewHazard={jest.fn()}
                onEditDraft={jest.fn()}
                onBack={jest.fn()}
            />
        );

        await waitFor(() => {
            expect(getByText('Failed to load hazard reports.')).toBeTruthy();
        });
    });

    it('filters hazards by draft', async () => {

        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHazards,
        });

        const { getByTestId, queryByText } = renderWithTheme(
            <HazardList
                riskAssessmentId={1}
                riskAssessmentTitle="Test Assessment"
                onViewHazard={jest.fn()}
                onEditDraft={jest.fn()}
                onBack={jest.fn()}
            />
        );

        await waitFor(() => getByTestId('filter-draft'));

        fireEvent.press(getByTestId('filter-draft'));

        expect(queryByText('Draft Hazard')).toBeTruthy();
        expect(queryByText('Submitted Hazard')).toBeNull();
    });

    it('calls onViewHazard when pressing a submitted hazard', async () => {

        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHazards,
        });

        const onViewHazard = jest.fn();

        const { getByTestId } = renderWithTheme(
            <HazardList
                riskAssessmentId={1}
                riskAssessmentTitle="Test Assessment"
                onViewHazard={onViewHazard}
                onEditDraft={jest.fn()}
                onBack={jest.fn()}
            />
        );

        await waitFor(() => getByTestId('risk-Submitted Hazard'));

        fireEvent.press(getByTestId('risk-Submitted Hazard'));

        expect(onViewHazard).toHaveBeenCalledWith(2);
    });

    it('shows unexpected error when fetch throws', async () => {

        (AuthenticationService.fetch as jest.Mock).mockRejectedValue(
            new Error('network error')
        );

        const { getByText } = renderWithTheme(
            <HazardList
                riskAssessmentId={1}
                riskAssessmentTitle="Test Assessment"
                onViewHazard={jest.fn()}
                onEditDraft={jest.fn()}
                onBack={jest.fn()}
            />
        );

        await waitFor(() => {
            expect(getByText('An unexpected error occurred.')).toBeTruthy();
        });

    });

    it('filters hazards by closed', async () => {

        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHazards,
        });

        const { getByTestId, queryByText } = renderWithTheme(
            <HazardList
                riskAssessmentId={1}
                riskAssessmentTitle="Test Assessment"
                onViewHazard={jest.fn()}
                onEditDraft={jest.fn()}
                onBack={jest.fn()}
            />
        );

        await waitFor(() => getByTestId('filter-closed'));

        fireEvent.press(getByTestId('filter-closed'));

        expect(queryByText('Closed Hazard')).toBeTruthy();
        expect(queryByText('Draft Hazard')).toBeNull();
    });

    it('filters hazards by submitted', async () => {

        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHazards,
        });

        const { getByTestId, queryByText } = renderWithTheme(
            <HazardList
                riskAssessmentId={1}
                riskAssessmentTitle="Test Assessment"
                onViewHazard={jest.fn()}
                onEditDraft={jest.fn()}
                onBack={jest.fn()}
            />
        );

        await waitFor(() => getByTestId('filter-submitted'));

        fireEvent.press(getByTestId('filter-submitted'));

        expect(queryByText('Submitted Hazard')).toBeTruthy();
        expect(queryByText('Draft Hazard')).toBeNull();
    });

    it('returns to list after finishing draft edit', async () => {

        (AuthenticationService.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockHazards,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    ...mockHazards[0],
                    questionOne: '',
                    questionTwo: '',
                    questionThree: '',
                    questionFour: '',
                    questionFive: '',
                    questionSix: null,
                    isDraft: true,
                    isClosed: false,
                    fileUrls: [],
                }),
            });

        const { getByTestId, queryByTestId } = renderWithTheme(
            <HazardList
                riskAssessmentId={1}
                riskAssessmentTitle="Test Assessment"
                onViewHazard={jest.fn()}
                onEditDraft={jest.fn()}
                onBack={jest.fn()}
            />
        );

        await waitFor(() => getByTestId('risk-Draft Hazard'));

        fireEvent.press(getByTestId('risk-Draft Hazard'));

        await waitFor(() => getByTestId('hazard-form'));

        fireEvent.press(getByTestId('done-button'));

        await waitFor(() => {
            expect(queryByTestId('hazard-form')).toBeNull();
        });

    });

});