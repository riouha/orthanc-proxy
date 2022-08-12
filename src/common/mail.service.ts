import nodemailer from "nodemailer";
import {
  AccountApi,
  AccountApiApiKeys,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "sib-api-v3-typescript";
var directTransport = require("nodemailer-direct-transport");

const sibApiKey = "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";
export class MialService {
  static async send() {
    // const client = new AccountApi();
    // client.setApiKey(AccountApiApiKeys.apiKey, sibApiKey);

    // const mailer = new TransactionalEmailsApi();
    // mailer.setApiKey(TransactionalEmailsApiApiKeys.apiKey, sibApiKey);
    // mailer
    //   .sendTransacEmail({
    //     sender: { email: "rabc.fake@gmail.com" },
    //     to: [{ email: "riouha.abc@gmail.com" }],
    //     subject: "test subject",
    //     textContent: "some text",
    //   })
    //   .then((res) => console.log(res))
    //   .catch((err) => console.log(err));

    // const transporter = nodemailer.createTransport({
    //   //   host: "smtp.netcorecloud.net",
    //   //   port: 25,
    //   //   secure: false,
    //   //   auth: {
    //   //     user: "rabcfake",
    //   //     pass: "rabcfake_19bb5673faa54cea237dd658e36b797f",
    //   //   },
    //   host: "smtp.mail.yahoo.com",
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     user: "riouha.abc@yahoo.com",
    //     pass: "dont4get.yoo",
    //   },
    //   logger: true,
    // });
    var transporter = nodemailer.createTransport(
      directTransport({
        name: "smtp.maskan13.ir",
      })
    );

    const info = await transporter.sendMail({
      from: "riouha.abc@maskan13.ir", //"rabc.fake@gmail.com",
      to: "riouha.abc@gmail.com",
      subject: "Hello",
      text: "Hello world?",
      //   html: "<b>Hello world?</b>",
    });
    console.log(info);
  }
}
