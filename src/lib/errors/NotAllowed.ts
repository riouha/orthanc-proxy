export class NotAllowedError extends Error {
  public statusCode = 405;
  constructor(public message: string, public data?: any) {
    super();

    //extend builtin class
    Object.setPrototypeOf(this, NotAllowedError.prototype);
  }
}
