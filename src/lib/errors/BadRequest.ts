export class BadRequestError extends Error {
    public statusCode = 400;
    constructor(public message: string, public data?: any) {
        super();

        //extend builtin class
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}