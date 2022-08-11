export class UnAuthorizedError extends Error {
  public statusCode = 401;
  constructor(message?: string, public data?: any) {
    super();
    this.message = message ?? "Anuthorized Request";

    //extend builtin class
    Object.setPrototypeOf(this, UnAuthorizedError.prototype);
  }
}
