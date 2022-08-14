import { DataSource } from "typeorm";
import { applicationConfigs } from "../../config/config";

class DbConnection {
  datasource = new DataSource({
    type: applicationConfigs.database.type as any,
    host: applicationConfigs.database.host,
    port: applicationConfigs.database.port,
    username: applicationConfigs.database.username,
    password: applicationConfigs.database.password,
    database: applicationConfigs.database.name,
    logging: applicationConfigs.database.log,
    connectTimeout: 300000,
    entities: process.env.NODE_ENV==="prod"?["build/**/*.entity.js"]:["src/**/*.entity.ts"],
    synchronize: true,
  });

  initialize = async () => {
    await this.datasource.initialize();
    console.info("connected to db ------------------------------------");
  };
}
export const dbConnection = new DbConnection();
