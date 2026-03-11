/**
 * HTTP Exception class to represent HTTP errors with status code and message.
 */
export class HttpException extends Error {
  /**
   * Creates an instance of HttpException.
   * @param statusCode HTTP status code representing the error type (e.g., 404, 500)
   * @param message A descriptive message providing details about the error
   */
  constructor(
    public statusCode: number,
    public message: string,
  ) {
    super(message);
    this.name = 'HttpException';
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
