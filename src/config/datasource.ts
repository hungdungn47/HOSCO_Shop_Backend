import { DataSource } from "typeorm";
import { Warehouse } from "../entities/Warehouse";
import { entities } from "../entities";
import env from 'dotenv';
env.config();

export const AppDataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_HOST,
  port: 1434,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: entities,
  synchronize: true,
  logging: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
