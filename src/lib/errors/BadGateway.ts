export class BadGatewayError extends Error {
    public statusCode = 502;
    constructor(public message: string, public data?: any) {
        super();

        //extend builtin class
        Object.setPrototypeOf(this, BadGatewayError.prototype);
    }

}