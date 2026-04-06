import { Alert, Platform, PermissionsAndroid } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
};

export const useDownload = () => {
    const handleDownload = async (url: string, filename: string) => {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            setTimeout(() => {
                Alert.alert('Permission Denied', 'Storage permission is required to download files.');
            }, 500);
            return;
        }

        const safeFilename = filename.replace(/[^a-zA-Z0-9 _-]/g, '').trim();

        const { dirs } = ReactNativeBlobUtil.fs;
        // This way works for the emulator
        const downloadDir = Platform.OS === 'android'
            ? '/storage/emulated/0/Download'
            : dirs.DocumentDir;

        // CHANGE TO THIS FOR PRODUCTION BUILD
        // const downloadDir = Platform.OS === 'android'
        //     ? ReactNativeBlobUtil.fs.dirs.DownloadDir ?? '/storage/emulated/0/Download'
        //     : ReactNativeBlobUtil.fs.dirs.DocumentDir;

        const filePath = `${downloadDir}/${safeFilename}.pdf`;

        try {
            const res = await ReactNativeBlobUtil.config({
                fileCache: true,
                path: filePath,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    title: safeFilename,
                    description: 'Downloading file...',
                    mime: 'application/pdf',
                    mediaScannable: true,
                    path: filePath,
                },
            }).fetch('GET', url);

            console.log('Saved to:', res.path());

            if (Platform.OS === 'ios') {
                await ReactNativeBlobUtil.ios.presentOptionsMenu(res.path());
            } else {
                setTimeout(() => {
                    Alert.alert('Downloaded', `${safeFilename} saved to Downloads.`);
                }, 500);
            }
        } catch (err) {
            setTimeout(() => {
                Alert.alert('Error', 'Failed to download the file.');
            }, 500);
            console.error(err);
        }
    };

    return { handleDownload };
};