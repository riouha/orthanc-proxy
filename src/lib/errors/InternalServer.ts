export class InternalServerError extends Error {
    public statusCode = 500;
    constructor(message?: string, public data?: any) {
        super();
        this.message = message ?? 'Internal Server Error';

        //extend builtin class
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}