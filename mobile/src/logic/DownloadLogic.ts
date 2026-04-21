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
  const handleDownload = async (base64: string, filename: string) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setTimeout(() => {
        Alert.alert('Permission Denied', 'Storage permission is required to download files.');
      }, 500);
      return;
    }

    const safeFilename = (filename.replace(/[^a-zA-Z0-9 _-]/g, '').trim()) || 'document';
    const cleanBase64 = base64.replace(/^data:application\/pdf;base64,/, '');

    try {
      if (Platform.OS === 'ios') {
        const filePath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${safeFilename}.pdf`;
        await ReactNativeBlobUtil.fs.writeFile(filePath, cleanBase64, 'base64');
        await ReactNativeBlobUtil.ios.presentOptionsMenu(filePath);
        return;
      }

      // Write directly to the public Downloads folder
      const filePath = `/storage/emulated/0/Download/${safeFilename}.pdf`;
      await ReactNativeBlobUtil.fs.writeFile(filePath, cleanBase64, 'base64');

      const exists = await ReactNativeBlobUtil.fs.exists(filePath);
      console.log('File exists after write:', exists);
      console.log('File path:', filePath);

      if (!exists) {
        throw new Error('File was not written to disk.');
      }

      await ReactNativeBlobUtil.android.addCompleteDownload({
        title: safeFilename,
        description: 'Download complete',
        mime: 'application/pdf',
        path: filePath,
        showNotification: true,
      });

      setTimeout(() => {
        Alert.alert('Downloaded', `${safeFilename} saved to Downloads.`);
      }, 500);

    } catch (err: any) {
      console.error('Download error:', err);
      setTimeout(() => {
        Alert.alert('Error', `Failed to save the file: ${err?.message ?? 'Unknown error'}`);
      }, 500);
    }
  };

  return { handleDownload };
};