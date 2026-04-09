/**
 * Application Settings
 * Central configuration for the Rent-A-Tech mobile and web application
 */

export const AppSettings = {
  // Backend API URL (10.0.2.2 = default emulator IP)
  API_URL: 'http://10.0.2.2:8080',

  // CDN URL for static assets
  CDN_URL: 'https://cdn-ltp.tomsw.uk',

  // BLE Service ID for advertising
  BLE_SERVICE_UUID: '0000FFFF-0000-1000-8000-00805F9B34FB',

  // BLE Characteristic ID for broadcasting the unique identifier
  BLE_CHARACTERISTIC_UUID: '0000ABCD-0000-1000-8000-00805F9B34FB',
};