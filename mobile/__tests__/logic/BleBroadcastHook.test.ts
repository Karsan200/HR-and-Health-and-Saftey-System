import { startAdvertising } from 'munim-bluetooth';
import { BleBroadcastHook, BleBroadcastTaskArgs } from '../../src/hook/BleBroadcastHook.ts';
import { AppSettings } from '../../src/AppSettings.ts';

jest.mock('munim-bluetooth', () => ({
  startAdvertising: jest.fn(),
  setServices: jest.fn(),
}));

const mockStartAdvertising = startAdvertising as jest.Mock;

describe('BleBroadcastHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when no broadcastId is provided', () => {
    it('should warn and return early if _taskDataArguments is undefined', async () => {
      const promise = BleBroadcastHook(undefined);
      await expect(promise).resolves.toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith('No broadcastId provided for BLE advertising');
    });

    it('should warn and return early if broadcastId is null', async () => {
      const args: BleBroadcastTaskArgs = { broadcastId: null };
      const promise = BleBroadcastHook(args);
      await expect(promise).resolves.toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith('No broadcastId provided for BLE advertising');
    });

    it('should not call startAdvertising or setServices', async () => {
      await BleBroadcastHook(undefined);
      expect(mockStartAdvertising).not.toHaveBeenCalled();
    });
  });

  describe('when a valid broadcastId is provided', () => {
    const args: BleBroadcastTaskArgs = { broadcastId: 'device-123' };

    it('should call startAdvertising with the correct arguments', async () => {
      BleBroadcastHook(args); // intentionally not awaited — promise never resolves
      await Promise.resolve(); // flush microtask queue

      expect(mockStartAdvertising).toHaveBeenCalledWith({
        serviceUUIDs: [AppSettings.BLE_SERVICE_UUID],
        advertisingData: {
          manufacturerData: 'device123'
        },
      });
    });

    it('should log the broadcastId being used', async () => {
      BleBroadcastHook(args);
      await Promise.resolve();

      expect(console.log).toHaveBeenCalledWith('Broadcasting as:', 'device123');
    });
  });
});