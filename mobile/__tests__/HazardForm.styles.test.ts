import hazardStyles, { getCommonInputProps } from '../src/screens/HazardForm.styles';

jest.mock('../src/theme/theme', () => ({
    FontSize: { xs14: 14, xxs12: 12, m20: 20 },
    BorderRadius: { smallTextField: 4, largeButtonsAndOutlines: 8 },
    TextStyles: { medium: { fontWeight: '500' } },
}));

const mockTheme = {
    greyBackground: '#f0f0f0',
    white: '#ffffff',
    black: '#000000',
    greyIconLight: '#cccccc',
    greyPrimaryMainText: '#333333',
    redTrafficPrimary: '#cc0000',
    redPrimary: '#ff0000',
};

describe('HazardForm.styles', () => {

    describe('hazardStyles', () => {
        it('returns a styles object when called with a theme', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles).toBeDefined();
            expect(typeof styles).toBe('object');
        });

        it('applies theme colours to container', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.container.backgroundColor).toBe(mockTheme.greyBackground);
        });

        it('applies theme colours to card', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.card.backgroundColor).toBe(mockTheme.white);
        });

        it('applies theme colours to cardTitle', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.cardTitle.color).toBe(mockTheme.black);
        });

        it('applies theme colours to fieldLabel', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.fieldLabel.color).toBe(mockTheme.greyPrimaryMainText);
        });

        it('applies theme colours to required asterisk', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.required.color).toBe(mockTheme.redTrafficPrimary);
        });

        it('applies theme colours to input', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.input.backgroundColor).toBe(mockTheme.white);
        });

        it('applies theme colours to checkboxLabel', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.checkboxLabel.color).toBe(mockTheme.greyPrimaryMainText);
        });

        it('applies theme colours to uploadButton', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.uploadButton.backgroundColor).toBe(mockTheme.redPrimary);
        });

        it('applies theme colours to uploadLabel', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.uploadLabel.color).toBe(mockTheme.white);
        });

        it('applies theme colours to photoCountText', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.photoCountText.color).toBe(mockTheme.greyPrimaryMainText);
        });

        it('applies theme colours to errorText', () => {
            const styles = hazardStyles(mockTheme);
            expect(styles.errorText.color).toBe(mockTheme.redTrafficPrimary);
        });
    });

    describe('getCommonInputProps', () => {
        it('returns an object when called with a theme', () => {
            const props = getCommonInputProps(mockTheme);
            expect(props).toBeDefined();
            expect(typeof props).toBe('object');
        });

        it('sets mode to outlined', () => {
            const props = getCommonInputProps(mockTheme);
            expect(props.mode).toBe('outlined');
        });

        it('applies theme colour to placeholderTextColor', () => {
            const props = getCommonInputProps(mockTheme);
            expect(props.placeholderTextColor).toBe(mockTheme.greyIconLight);
        });

        it('applies theme colour to textColor', () => {
            const props = getCommonInputProps(mockTheme);
            expect(props.textColor).toBe(mockTheme.black);
        });

        it('applies theme colour to style backgroundColor', () => {
            const props = getCommonInputProps(mockTheme);
            expect(props.style.backgroundColor).toBe(mockTheme.white);
        });
    });
});