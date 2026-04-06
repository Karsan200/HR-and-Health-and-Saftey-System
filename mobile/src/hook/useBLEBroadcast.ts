import { useEffect } from 'react';
import { Platform } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import {
  startAdvertising,
  stopAdvertising,
  requestBluetoothPermission,
  isBluetoothEnabled,
} from 'munim-bluetooth';

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const bleTask = async (taskData: { uuid: string }) => {
  const { uuid } = taskData;

  startAdvertising({
    serviceUUIDs: [uuid],
    advertisingData: {
      completeServiceUUIDs128: [uuid],
      flags: 0x06,
    },
  });

  await new Promise<void>(async () => {
    while (BackgroundService.isRunning()) {
      await sleep(10000);
    }
  });
};

export function useBLEBroadcast(uuid: string | null): void {
  useEffect(() => {
    if (!uuid) {
      if (BackgroundService.isRunning()) {
        stopAdvertising();
        BackgroundService.stop();
        console.log('[BLE] Broadcast stopped — user logged out');
      }
      return;
    }

    if (Platform.OS !== 'android') return;

    async function start(): Promise<void> {
      if (BackgroundService.isRunning()) {
        console.warn('[BLE] Already running, skipping start');
        return;
      }

      const enabled = await isBluetoothEnabled();
      if (!enabled) {
        console.warn('[BLE] Bluetooth not enabled');
        return;
      }

      const granted = await requestBluetoothPermission();
      if (!granted) {
        console.warn('[BLE] Permission denied');
        return;
      }

      await BackgroundService.start(bleTask, {
        taskName: 'BLEBroadcast',
        taskTitle: 'Clock-In Active',
        taskDesc: 'Broadcasting your ID for clock-in/out',
        taskIcon: { name: 'ic_launcher', type: 'mipmap' },
        color: '#000000',
        parameters: { uuid },
      });

      console.log('[BLE] Broadcasting:', uuid);
    }

    start();
  }, [uuid]);
}
