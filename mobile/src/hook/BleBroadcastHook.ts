import { startAdvertising, setServices } from 'munim-bluetooth';

export interface BleBroadcastTaskArgs {
  broadcastId: string | null; // the Service UUID to advertise
}

async function startBleAdvertising(broadcastId: string) {
  startAdvertising({
    serviceUUIDs: ['FFFF'],
    localName: 'Rent-A-Tech Utility',
  });

  setServices([
    {
      uuid: 'FFFF',
      characteristics: [
        {
          uuid: broadcastId,
          properties: ['read', 'notify'],
          value: 'Rent-A-Tech',
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