/**
 * HTTP Exception class to represent HTTP errors with status code and message.
 */
export class HttpException extends Error {
    /** HTTP status code representing the error type (e.g., 404, 500) */
    public statusCode: number;
    /** A descriptive message providing details about the error */
    public message: string;

    /**
     * Creates an instance of HttpException.
     * @param statusCode HTTP status code representing the error type (e.g., 404, 500)
     * @param message A descriptive message providing details about the error
     */
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.name = 'HttpException';
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}