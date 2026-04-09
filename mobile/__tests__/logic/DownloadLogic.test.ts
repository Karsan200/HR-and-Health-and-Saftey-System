import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { useDownload } from '../../src/logic/DownloadLogic';
import { renderHook } from '@testing-library/react-native';

jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {
        config: jest.fn(() => ({
            fetch: jest.fn(() =>
                Promise.resolve({ path: () => '/storage/emulated/0/Download/test.pdf' })
            ),
        })),
        fs: {
            dirs: {
                DownloadDir: '/storage/emulated/0/Download',
                DocumentDir: '/data/user/0/com.frontend/files',
            },
        },
        ios: {
            presentOptionsMenu: jest.fn(),
        },
    },
}));

describe('useDownload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    /**
     * Ensures handleDownload is returned from the hook.
     */
    it('returns handleDownload function', () => {
        const { result } = renderHook(() => useDownload());
        expect(typeof result.current.handleDownload).toBe('function');
    });

    /**
     * Ensures successful download shows alert on Android.
     */
    it('shows downloaded alert on Android after successful download', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android');

        const { result } = renderHook(() => useDownload());
        await result.current.handleDownload('https://test/file.pdf', 'January 2026');

        jest.advanceTimersByTime(500);

        expect(alertSpy).toHaveBeenCalledWith(
            'Downloaded',
            'January 2026 saved to Downloads.'
        );
    });

    /**
     * Ensures special characters are stripped from the filename.
     */
    it('sanitises filename before saving', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android');

        const { result } = renderHook(() => useDownload());
        await result.current.handleDownload('https://test/file.pdf', 'P60 – Tax Year 2024/25');

        jest.advanceTimersByTime(500);

        expect(alertSpy).toHaveBeenCalledWith(
            'Downloaded',
            'P60  Tax Year 202425 saved to Downloads.'
        );
    });

    /**
     * Ensures iOS share sheet is opened instead of an alert on iOS.
     */
    it('opens iOS share sheet on iOS instead of alert', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'ios');

        const ReactNativeBlobUtil = require('react-native-blob-util').default;

        const { result } = renderHook(() => useDownload());
        await result.current.handleDownload('https://test/file.pdf', 'January 2026');

        jest.advanceTimersByTime(500);

        expect(ReactNativeBlobUtil.ios.presentOptionsMenu).toHaveBeenCalledWith(
            '/storage/emulated/0/Download/test.pdf'
        );
        expect(alertSpy).not.toHaveBeenCalledWith('Downloaded', expect.any(String));
    });

    /**
     * Ensures error alert is shown when download fails.
     */
    it('shows error alert when download fails', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android');

        const ReactNativeBlobUtil = require('react-native-blob-util').default;
        ReactNativeBlobUtil.config.mockReturnValueOnce({
            fetch: jest.fn(() => Promise.reject(new Error('Download failed'))),
        });

        const { result } = renderHook(() => useDownload());
        await result.current.handleDownload('https://test/file.pdf', 'January 2026');

        jest.advanceTimersByTime(500);

        expect(alertSpy).toHaveBeenCalledWith(
            'Error',
            'Failed to download the file.'
        );
    });

    it('shows permission denied alert when storage permission is refused', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android');
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue(29);

        jest.spyOn(PermissionsAndroid, 'request').mockResolvedValueOnce(
            PermissionsAndroid.RESULTS.DENIED
        );

        const { result } = renderHook(() => useDownload());
        await result.current.handleDownload('https://test/file.pdf', 'January 2026');

        jest.advanceTimersByTime(500);

        expect(alertSpy).toHaveBeenCalledWith(
            'Permission Denied',
            'Storage permission is required to download files.'
        );
    });

    it('downloads successfully when storage permission is granted on older Android', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android');
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue(29);

        jest.spyOn(PermissionsAndroid, 'request').mockResolvedValueOnce(
            PermissionsAndroid.RESULTS.GRANTED
        );

        const { result } = renderHook(() => useDownload());
        await result.current.handleDownload('https://test/file.pdf', 'January 2026');

        jest.advanceTimersByTime(500);

        expect(alertSpy).toHaveBeenCalledWith(
            'Downloaded',
            'January 2026 saved to Downloads.'
        );
    });

    it('skips permission request on Android 33 and above', async () => {
        const requestSpy = jest.spyOn(PermissionsAndroid, 'request');
        jest.replaceProperty(Platform, 'OS', 'android');
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue(33);

        const { result } = renderHook(() => useDownload());
        await result.current.handleDownload('https://test/file.pdf', 'January 2026');

        expect(requestSpy).not.toHaveBeenCalled();
    });
});