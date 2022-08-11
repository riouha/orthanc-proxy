export class ForbidenError extends Error {
    public statusCode = 403;
    constructor(public message: string, public data?: any) {
        super();

        //extend builtin class
        Object.setPrototypeOf(this, ForbidenError.prototype);
    }
}