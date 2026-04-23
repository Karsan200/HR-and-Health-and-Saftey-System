import { PermissionsAndroid, Platform } from 'react-native';

export const requestBlePermissions = async () => {
  if (Platform.OS !== 'android') return true;

  const apiLevel = parseInt(String(Platform.Version), 10);

  // Android 12+ (API 31+) uses BLUETOOTH_SCAN/ADVERTISE instead of location
  if (apiLevel >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);

    return Object.values(results).every(
      r => r === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  // Android < 12 requires fine location to use BLE
  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  return Object.values(results).every(
    r => r === PermissionsAndroid.RESULTS.GRANTED
  );
};