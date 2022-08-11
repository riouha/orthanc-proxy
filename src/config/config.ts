import dotenv from "dotenv";
dotenv.config();
export const configs = {
  app: {
    port: +process.env.PORT,
  },
};
