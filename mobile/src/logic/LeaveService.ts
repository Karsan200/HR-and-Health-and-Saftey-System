import AuthenticationService from './AuthenticationService';
import { HttpException } from '../exception/HttpException';

/**
 * Format of the leave type returned from the backend.
 * This is used to display the leave types in the modal
 * and send the selected type back to the backend.
 */
export type LeaveType = {
  leaveTypeId: number;
  name: string;
  colourIcon: string;
  colourBg: string;
  iconType: string;
};

/**
 * Payload used to create a leave request.
 */
type CreateLeaveRequest = {
  startDate: string;
  endDate: string;
  leaveTypeId: number;
  notes: string;
};

/**
 * Loads the available leave types from the backend.
 */
export default class LeaveService {
  static async getLeaveTypes(): Promise<LeaveType[]> {
    const response = await AuthenticationService.fetch('/api/leave/types', {
      method: 'GET',
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to load leave types. Status: ${response.status}`);
    }

    if (!text) {
      return [];
    }

    return JSON.parse(text) as LeaveType[];
  }

  /**
   * Sends the leave request to the backend.
   * On success, the screen is refreshed and the modal is closed.
   */
  static async createLeave(request: CreateLeaveRequest): Promise<void> {
    const response = await AuthenticationService.fetch('/api/leave/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new HttpException(
        response.status,
        responseText || `Unable to submit leave request. Status: ${response.status}`
      );
    }
  }
}
