export class ConflictError extends Error {
    public statusCode = 409;
    constructor(public message: string, public data?: any) {
        super();

        //extend builtin class
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}