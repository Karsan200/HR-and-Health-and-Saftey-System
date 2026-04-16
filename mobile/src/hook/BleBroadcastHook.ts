import { startAdvertising } from 'munim-bluetooth';
import { AppSettings } from '../AppSettings.ts';

export interface BleBroadcastTaskArgs {
  broadcastId: string | null; // the Service UUID to advertise
}

function broadcastIdToManufacturerData(broadcastId: string): string {
  return broadcastId.replace(/-/g, '');
}

async function startBleAdvertising(broadcastId: string) {
  startAdvertising({
    serviceUUIDs: [AppSettings.BLE_SERVICE_UUID],
    advertisingData: {
      manufacturerData: broadcastIdToManufacturerData(broadcastId),
    }
  });
  console.log('Broadcasting as:', broadcastIdToManufacturerData(broadcastId));
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
