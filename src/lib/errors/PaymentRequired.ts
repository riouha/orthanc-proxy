export class PaymentRequiredError extends Error {
  public statusCode = 402;
  constructor(public message: string, public data?: any) {
    super();

    //extend builtin class
    Object.setPrototypeOf(this, PaymentRequiredError.prototype);
  }
}
