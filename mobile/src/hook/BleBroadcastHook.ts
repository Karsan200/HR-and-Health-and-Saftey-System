import { startAdvertising, setServices } from 'munim-bluetooth';
import { AppSettings } from '../AppSettings.ts';

export interface BleBroadcastTaskArgs {
  broadcastId: string | null; // the Service UUID to advertise
}

async function startBleAdvertising(broadcastId: string) {
  startAdvertising({
    serviceUUIDs: [AppSettings.BLE_SERVICE_UUID],
    localName: `R.A.T ${broadcastId}`,
  });

  setServices([
    {
      uuid: AppSettings.BLE_SERVICE_UUID,
      characteristics: [
        {
          uuid: broadcastId,
          properties: ['read', 'notify'],
          value: 'RAT',
        },
      ],
    },
  ]);
}

export const BleBroadcastHook = async (
  _taskDataArguments?: BleBroadcastTaskArgs,
): Promise<void> => {
  // Start the bluetooth advertising with the provided broadcastId
  if (_taskDataArguments?.broadcastId) {
    await startBleAdvertising(_taskDataArguments.broadcastId);
  } else {
    console.warn('No broadcastId provided for BLE advertising');
    return;
  }

  // Keep the service running indefinitely
  await new Promise<void>(() => {});
};
