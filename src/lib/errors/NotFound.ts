export class NotFoundError extends Error {
  public statusCode = 404;
  constructor(message: INotFoundInput | string, public data?: any) {
    super();

    if (typeof message === "string") this.message = message;
    else {
      const key = Object.keys(message).find((key) => key !== "field" && key !== "message");
      this.message = key ? `${message.field} with ${key} {${message[key]}} not found` : `${message.field} not found`;
    }

    //extend builtin class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

interface INotFoundInput {
  field: string;
  [key: string]: any;
}
