import { PermissionsAndroid, Platform } from 'react-native';
import { requestBlePermissions } from '../../src/logic/RequestBlePermissions.ts';

jest.mock('react-native', () => ({
  PermissionsAndroid: {
    requestMultiple: jest.fn(),
    PERMISSIONS: {
      BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
  },
  Platform: {
    OS: 'android',
    Version: '31',
  },
}));

type MockedRequestMultiple = jest.MockedFunction<typeof PermissionsAndroid.requestMultiple>;
type PermissionResult = Awaited<ReturnType<typeof PermissionsAndroid.requestMultiple>>;

const granted = (permissions: string[]): PermissionResult =>
  Object.fromEntries(permissions.map(p => [p, 'granted'])) as PermissionResult;

const withResult = (base: string[], overrides: Record<string, string>): PermissionResult =>
  Object.fromEntries(base.map(p => [p, overrides[p] ?? 'granted'])) as PermissionResult;

const ANDROID_12_PERMISSIONS = [
  'android.permission.BLUETOOTH_ADVERTISE',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.BLUETOOTH_SCAN',
];

const LEGACY_PERMISSIONS = [
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
];

describe('requestBlePermissions', () => {
  let requestMultipleMock: MockedRequestMultiple;

  beforeEach(() => {
    jest.clearAllMocks();
    requestMultipleMock = jest.spyOn(
      PermissionsAndroid,
      'requestMultiple'
    ) as MockedRequestMultiple;
  });

  describe('iOS', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('returns true without requesting any permissions', async () => {
      const result = await requestBlePermissions();

      expect(result).toBe(true);
      expect(requestMultipleMock).not.toHaveBeenCalled();
    });
  });

  describe('Android 12+ (API >= 31)', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      Platform.Version = '31';
    });

    it('requests BLUETOOTH_ADVERTISE, BLUETOOTH_CONNECT, BLUETOOTH_SCAN', async () => {
      requestMultipleMock.mockResolvedValue(granted(ANDROID_12_PERMISSIONS));

      await requestBlePermissions();

      expect(requestMultipleMock).toHaveBeenCalledWith(ANDROID_12_PERMISSIONS);
    });

    it('returns true when all permissions are granted', async () => {
      requestMultipleMock.mockResolvedValue(granted(ANDROID_12_PERMISSIONS));

      const result = await requestBlePermissions();
      expect(result).toBe(true);
    });

    it('returns false when BLUETOOTH_ADVERTISE is denied', async () => {
      requestMultipleMock.mockResolvedValue(
        withResult(ANDROID_12_PERMISSIONS, { 'android.permission.BLUETOOTH_ADVERTISE': 'denied' })
      );

      const result = await requestBlePermissions();
      expect(result).toBe(false);
    });

    it('returns false when BLUETOOTH_CONNECT is denied', async () => {
      requestMultipleMock.mockResolvedValue(
        withResult(ANDROID_12_PERMISSIONS, { 'android.permission.BLUETOOTH_CONNECT': 'denied' })
      );

      const result = await requestBlePermissions();
      expect(result).toBe(false);
    });

    it('returns false when BLUETOOTH_SCAN is denied', async () => {
      requestMultipleMock.mockResolvedValue(
        withResult(ANDROID_12_PERMISSIONS, { 'android.permission.BLUETOOTH_SCAN': 'denied' })
      );

      const result = await requestBlePermissions();
      expect(result).toBe(false);
    });

    it('returns false when a permission is never_ask_again', async () => {
      requestMultipleMock.mockResolvedValue(
        withResult(ANDROID_12_PERMISSIONS, { 'android.permission.BLUETOOTH_CONNECT': 'never_ask_again' })
      );

      const result = await requestBlePermissions();
      expect(result).toBe(false);
    });

    it('returns false when all permissions are denied', async () => {
      requestMultipleMock.mockResolvedValue(
        withResult(ANDROID_12_PERMISSIONS, {
          'android.permission.BLUETOOTH_ADVERTISE': 'denied',
          'android.permission.BLUETOOTH_CONNECT': 'denied',
          'android.permission.BLUETOOTH_SCAN': 'denied',
        })
      );

      const result = await requestBlePermissions();
      expect(result).toBe(false);
    });

    it('does not request location permissions', async () => {
      requestMultipleMock.mockResolvedValue(granted(ANDROID_12_PERMISSIONS));

      await requestBlePermissions();

      const requested = requestMultipleMock.mock.calls[0][0];
      expect(requested).not.toContain('android.permission.ACCESS_FINE_LOCATION');
      expect(requested).not.toContain('android.permission.ACCESS_COARSE_LOCATION');
    });

    it('handles API level exactly at boundary (31)', async () => {
      Platform.Version = '31';
      requestMultipleMock.mockResolvedValue(granted(ANDROID_12_PERMISSIONS));

      const result = await requestBlePermissions();
      expect(result).toBe(true);

      const requested = requestMultipleMock.mock.calls[0][0];
      expect(requested).toContain('android.permission.BLUETOOTH_ADVERTISE');
    });
  });

  describe('Android < 12 (API < 31)', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      Platform.Version = '30';
    });

    it('requests ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION', async () => {
      requestMultipleMock.mockResolvedValue(granted(LEGACY_PERMISSIONS));

      await requestBlePermissions();

      expect(requestMultipleMock).toHaveBeenCalledWith(LEGACY_PERMISSIONS);
    });

    it('returns true when both location permissions are granted', async () => {
      requestMultipleMock.mockResolvedValue(granted(LEGACY_PERMISSIONS));

      const result = await requestBlePermissions();
      expect(result).toBe(true);
    });

    it('returns false when ACCESS_FINE_LOCATION is denied', async () => {
      requestMultipleMock.mockResolvedValue(
        withResult(LEGACY_PERMISSIONS, { 'android.permission.ACCESS_FINE_LOCATION': 'denied' })
      );

      const result = await requestBlePermissions();
      expect(result).toBe(false);
    });

    it('returns false when ACCESS_COARSE_LOCATION is denied', async () => {
      requestMultipleMock.mockResolvedValue(
        withResult(LEGACY_PERMISSIONS, { 'android.permission.ACCESS_COARSE_LOCATION': 'denied' })
      );

      const result = await requestBlePermissions();
      expect(result).toBe(false);
    });

    it('returns false when a permission is never_ask_again', async () => {
      requestMultipleMock.mockResolvedValue(
        withResult(LEGACY_PERMISSIONS, { 'android.permission.ACCESS_FINE_LOCATION': 'never_ask_again' })
      );

      const result = await requestBlePermissions();
      expect(result).toBe(false);
    });

    it('does not request Bluetooth-specific permissions', async () => {
      requestMultipleMock.mockResolvedValue(granted(LEGACY_PERMISSIONS));

      await requestBlePermissions();

      const requested = requestMultipleMock.mock.calls[0][0];
      expect(requested).not.toContain('android.permission.BLUETOOTH_ADVERTISE');
      expect(requested).not.toContain('android.permission.BLUETOOTH_SCAN');
    });

    it('handles API level exactly at boundary (30)', async () => {
      Platform.Version = '30';
      requestMultipleMock.mockResolvedValue(granted(LEGACY_PERMISSIONS));

      const result = await requestBlePermissions();
      expect(result).toBe(true);

      const requested = requestMultipleMock.mock.calls[0][0];
      expect(requested).toContain('android.permission.ACCESS_FINE_LOCATION');
    });
  });
});