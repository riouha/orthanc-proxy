import { IResponse } from "./IResponse";

export class Result {
  constructor(public status: number, public response: IResponse<any>) {}
}
