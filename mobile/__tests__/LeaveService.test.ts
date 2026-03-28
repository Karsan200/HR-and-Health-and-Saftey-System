import LeaveService from '../src/logic/LeaveService';
import AuthenticationService from '../src/logic/AuthenticationService';
import { HttpException } from '../src/exception/HttpException';

jest.mock('../src/logic/AuthenticationService');

describe('LeaveService', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = AuthenticationService.fetch as jest.Mock;
  });

  describe('getLeaveTypes', () => {
    it('should fetch and return leave types successfully', async () => {
      // Given the backend returns a successful response with leave type data
      const mockLeaveTypes = [
        {
          leaveTypeId: 1,
          name: 'Annual Leave',
          colourIcon: '#111111',
          colourBg: '#FFFFFF',
          iconType: 'calendar',
        },
        {
          leaveTypeId: 2,
          name: 'Sick Leave',
          colourIcon: '#222222',
          colourBg: '#EEEEEE',
          iconType: 'medical-bag',
        },
      ];

      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockLeaveTypes),
      });

      // When leave types are requested from the service
      const result = await LeaveService.getLeaveTypes();

      // Then the request should be sent to the correct endpoint and the parsed leave types should be returned
      expect(fetchMock).toHaveBeenCalledWith('/api/leave/types', {
        method: 'GET',
      });
      expect(result).toEqual(mockLeaveTypes);
    });

    it('should return an empty array when the response body is empty', async () => {
      // Given the backend returns a successful response with no body content
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => '',
      });

      // When leave types are requested from the service
      const result = await LeaveService.getLeaveTypes();

      // Then an empty array should be returned
      expect(result).toEqual([]);
    });

    it('should throw an error when the response is not ok', async () => {
      // Given the backend returns a failed response status
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => '',
      });

      // When the leave types are requested
      const action = LeaveService.getLeaveTypes();

      // Then an error describing the failed status should be thrown
      await expect(action).rejects.toThrow(
        'Failed to load leave types. Status: 500',
      );
    });
  });

  describe('createLeave', () => {
    it('should send the leave request successfully', async () => {
      // Given the backend accepts the leave request successfully
      const request = {
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        leaveTypeId: 1,
        notes: 'Annual leave',
      };

      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => '',
      });

      // When the leave request is submitted
      await LeaveService.createLeave(request);

      // Then the request should be posted to the correct endpoint with the expected payload
      expect(fetchMock).toHaveBeenCalledWith('/api/leave/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
    });

    it('should throw HttpException with default message when response is not ok and body is empty', async () => {
      // Given the backend returns a failed response with no response body
      const request = {
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        leaveTypeId: 1,
        notes: 'Annual leave',
      };

      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => '',
      });

      // When the leave request is submitted
      const action = LeaveService.createLeave(request);

      // Then a HttpException should be thrown using the default fallback message
      await expect(action).rejects.toBeInstanceOf(HttpException);
      await expect(action).rejects.toMatchObject({
        statusCode: 400,
        message: 'Unable to submit leave request. Status: 400',
      });
    });

    it('should throw HttpException using parsed message field from the response body', async () => {
      // Given the backend returns a failed response with a JSON message field
      const request = {
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        leaveTypeId: 1,
        notes: 'Annual leave',
      };

      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({
          message: 'Leave type is required.',
        }),
      });

      // When the leave request is submitted
      const action = LeaveService.createLeave(request);

      // Then a HttpException should be thrown using the parsed message value
      await expect(action).rejects.toMatchObject({
        statusCode: 400,
        message: 'Leave type is required.',
      });
    });

    it('should throw HttpException using parsed error field from the response body', async () => {
      // Given the backend returns a failed response with a JSON error field
      const request = {
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        leaveTypeId: 1,
        notes: 'Annual leave',
      };

      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({
          error: 'Authenticated account not found.',
        }),
      });

      // When the leave request is submitted
      const action = LeaveService.createLeave(request);

      // Then a HttpException should be thrown using the parsed error value
      await expect(action).rejects.toMatchObject({
        statusCode: 401,
        message: 'Authenticated account not found.',
      });
    });

    it('should throw HttpException using the raw response text when parsed JSON has no message or error field', async () => {
      // Given the backend returns a failed response with JSON that does not contain a message or error field
      const request = {
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        leaveTypeId: 1,
        notes: 'Annual leave',
      };

      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({
          details: 'Some other structure',
        }),
      });

      // When the leave request is submitted
      const action = LeaveService.createLeave(request);

      // Then a HttpException should be thrown using the raw response text
      await expect(action).rejects.toMatchObject({
        statusCode: 400,
        message: JSON.stringify({
          details: 'Some other structure',
        }),
      });
    });

    it('should throw HttpException using the raw response text when the body is not valid JSON', async () => {
      // Given the backend returns a failed response with plain text instead of JSON
      const request = {
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        leaveTypeId: 1,
        notes: 'Annual leave',
      };

      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      // When the leave request is submitted
      const action = LeaveService.createLeave(request);

      // Then a HttpException should be thrown using the raw text response
      await expect(action).rejects.toMatchObject({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });
});
