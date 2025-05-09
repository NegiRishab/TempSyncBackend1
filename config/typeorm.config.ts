import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

config();

const configService = new ConfigService();
const DB_ENTITIES =
  configService.get<string>("DB_ENTITIES") ?? "dist/**/*.entity.js";
const DB_MIGRATIONS =
  configService.get<string>("DB_MIGRATIONS") ?? "dist/migrations/*.js";

let sslConfig = {};

if (process.env.NODE_ENV === "local") {
  sslConfig = false;
}
const dataSource: PostgresConnectionOptions = {
  type: "postgres",
  url: configService.get("DB_URL"),
  logging: configService.get("DB_LOGGING"),
  entities: [DB_ENTITIES],
  migrations: [DB_MIGRATIONS],
  ssl: sslConfig,
  migrationsTransactionMode: "each",
};

module.exports = new DataSource(dataSource);
