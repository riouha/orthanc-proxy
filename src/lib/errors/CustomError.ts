export class CustomError extends Error {
    constructor(public statusCode: number, public message: string, public data?: any) {
        super();

        //extend builtin class
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}