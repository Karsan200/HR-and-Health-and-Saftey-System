import { Alert, Platform, PermissionsAndroid } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useDownload } from '../../src/logic/DownloadLogic';

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Platform: { OS: 'android', Version: 33 },
  PermissionsAndroid: {
    request: jest.fn(),
    PERMISSIONS: { WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE' },
    RESULTS: { GRANTED: 'granted' },
  },
}));

jest.mock('react-native-blob-util', () => ({
  fs: {
    dirs: { DocumentDir: '/mock/documents' },
    writeFile: jest.fn(),
    exists: jest.fn(),
  },
  ios: { presentOptionsMenu: jest.fn() },
  android: { addCompleteDownload: jest.fn() },
}));

const VALID_BASE64 = 'data:application/pdf;base64,JVBERi0xLjQK';
const CLEAN_BASE64  = 'JVBERi0xLjQK';
const FILENAME      = 'test-file';

/** Advance timers so setTimeout(() => Alert.alert(...), 500) fires. */
const flushAlerts = () => jest.runAllTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();

  // Sane defaults — override per test as needed
  (Platform as any).OS      = 'android';
  (Platform as any).Version = 33;

  (ReactNativeBlobUtil.fs.writeFile as jest.Mock).mockResolvedValue(undefined);
  (ReactNativeBlobUtil.fs.exists   as jest.Mock).mockResolvedValue(true);
  (ReactNativeBlobUtil.android.addCompleteDownload as jest.Mock).mockResolvedValue(undefined);
  (ReactNativeBlobUtil.ios.presentOptionsMenu      as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useDownload – requestStoragePermission', () => {
  it('requests WRITE_EXTERNAL_STORAGE on Android < 33', async () => {
    (Platform as any).Version = 32;
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');

    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      'android.permission.WRITE_EXTERNAL_STORAGE'
    );
  });

  it('skips the permission request on Android >= 33', async () => {
    (Platform as any).Version = 33;

    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(PermissionsAndroid.request).not.toHaveBeenCalled();
  });

  it('skips the permission request on iOS', async () => {
    (Platform as any).OS = 'ios';

    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(PermissionsAndroid.request).not.toHaveBeenCalled();
  });

  it('shows a permission-denied alert and aborts when permission is refused', async () => {
    (Platform as any).Version = 32;
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');

    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);
    flushAlerts();

    expect(Alert.alert).toHaveBeenCalledWith(
      'Permission Denied',
      'Storage permission is required to download files.'
    );
    expect(ReactNativeBlobUtil.fs.writeFile).not.toHaveBeenCalled();
  });
});

describe('useDownload – filename sanitisation', () => {
  it('strips characters that are not alphanumeric, space, underscore, or hyphen', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, 'my£file!@#.pdf');

    const writtenPath = (ReactNativeBlobUtil.fs.writeFile as jest.Mock).mock.calls[0][0] as string;
    expect(writtenPath).toContain('myfilepdf');          // special chars removed
    expect(writtenPath).not.toMatch(/[£!@#]/);
  });

  it('falls back to "document" when the sanitised name is empty', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, '!!!###');

    const writtenPath = (ReactNativeBlobUtil.fs.writeFile as jest.Mock).mock.calls[0][0] as string;
    expect(writtenPath).toContain('document.pdf');
  });

  it('trims leading/trailing whitespace from the filename', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, '  invoice  ');

    const writtenPath = (ReactNativeBlobUtil.fs.writeFile as jest.Mock).mock.calls[0][0] as string;
    expect(writtenPath).toContain('invoice.pdf');
    expect(writtenPath).not.toMatch(/^\s|\s$/);
  });
});

describe('useDownload – base64 cleaning', () => {
  it('strips the data-URI prefix before writing', async () => {
    const { handleDownload } = useDownload();
    await handleDownload('data:application/pdf;base64,ABC123', FILENAME);

    const writtenData = (ReactNativeBlobUtil.fs.writeFile as jest.Mock).mock.calls[0][1];
    expect(writtenData).toBe('ABC123');
    expect(writtenData).not.toContain('data:application/pdf;base64,');
  });

  it('passes raw base64 through unchanged when there is no data-URI prefix', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(CLEAN_BASE64, FILENAME);

    const writtenData = (ReactNativeBlobUtil.fs.writeFile as jest.Mock).mock.calls[0][1];
    expect(writtenData).toBe(CLEAN_BASE64);
  });
});

describe('useDownload – iOS path', () => {
  beforeEach(() => {
    (Platform as any).OS = 'ios';
  });

  it('writes the file to the iOS DocumentDir', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(ReactNativeBlobUtil.fs.writeFile).toHaveBeenCalledWith(
      `/mock/documents/${FILENAME}.pdf`,
      CLEAN_BASE64,
      'base64'
    );
  });

  it('opens the iOS share/options menu after writing', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(ReactNativeBlobUtil.ios.presentOptionsMenu).toHaveBeenCalledWith(
      `/mock/documents/${FILENAME}.pdf`
    );
  });

  it('does NOT call addCompleteDownload on iOS', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(ReactNativeBlobUtil.android.addCompleteDownload).not.toHaveBeenCalled();
  });

  it('shows an error alert when presentOptionsMenu rejects', async () => {
    (ReactNativeBlobUtil.ios.presentOptionsMenu as jest.Mock).mockRejectedValue(
      new Error('Share failed')
    );

    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);
    flushAlerts();

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save the file: Share failed');
  });
});

describe('useDownload – Android path', () => {
  it('writes the file to the public Downloads folder', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(ReactNativeBlobUtil.fs.writeFile).toHaveBeenCalledWith(
      `/storage/emulated/0/Download/${FILENAME}.pdf`,
      CLEAN_BASE64,
      'base64'
    );
  });

  it('calls addCompleteDownload with the correct metadata', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(ReactNativeBlobUtil.android.addCompleteDownload).toHaveBeenCalledWith({
      title:           FILENAME,
      description:     'Download complete',
      mime:            'application/pdf',
      path:            `/storage/emulated/0/Download/${FILENAME}.pdf`,
      showNotification: true,
    });
  });

  it('shows a success alert after download completes', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);
    flushAlerts();

    expect(Alert.alert).toHaveBeenCalledWith(
      'Downloaded',
      `${FILENAME} saved to Downloads.`
    );
  });

  it('throws and shows an error alert when the file does not exist after writing', async () => {
    (ReactNativeBlobUtil.fs.exists as jest.Mock).mockResolvedValue(false);

    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);
    flushAlerts();

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Failed to save the file: File was not written to disk.'
    );
  });

  it('shows an error alert when writeFile rejects', async () => {
    (ReactNativeBlobUtil.fs.writeFile as jest.Mock).mockRejectedValue(
      new Error('Disk full')
    );

    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);
    flushAlerts();

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save the file: Disk full');
  });

  it('shows a generic error message when the error has no message property', async () => {
    (ReactNativeBlobUtil.fs.writeFile as jest.Mock).mockRejectedValue('string error');

    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);
    flushAlerts();

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save the file: Unknown error');
  });

  it('does NOT call presentOptionsMenu on Android', async () => {
    const { handleDownload } = useDownload();
    await handleDownload(VALID_BASE64, FILENAME);

    expect(ReactNativeBlobUtil.ios.presentOptionsMenu).not.toHaveBeenCalled();
  });
});