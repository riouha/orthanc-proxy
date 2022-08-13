import dotenv from "dotenv";
dotenv.config();

export const applicationConfigs = {
  app: {
    port: +process.env.PORT,
  },
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    name: process.env.DATABASE_NAME,
    log: process.env.DATABASE_LOG == "true",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};