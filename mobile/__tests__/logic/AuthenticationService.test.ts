import AuthenticationService from '../../src/logic/AuthenticationService';
import {AppSettings} from "../../src/AppSettings.ts";

describe('AuthenticationService', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({ ok: true } as Response),
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have a static fetch method', () => {
    expect(AuthenticationService.fetch).toBeDefined();
    expect(typeof AuthenticationService.fetch).toBe('function');
  });

  it('fetch method should return a Promise', async () => {
    const result = AuthenticationService.fetch('', {});
    expect(result).toBeInstanceOf(Promise);
    await result;
  });

  it('should call fetch with correct arguments', async () => {
    await AuthenticationService.fetch('', { method: 'GET' });

    expect(globalThis.fetch).toHaveBeenCalledWith(AppSettings.API_URL, {
      method: 'GET',
    });
  });
});