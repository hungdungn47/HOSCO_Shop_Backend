import express from "express";
import sql from 'mssql';
import cors from 'cors';
import env from 'dotenv';
import bodyParser from "body-parser";
import { setupSwagger } from "./config/swagger";
import { AppDataSource } from "./config/datasource";
import router from './routes'

env.config();

const app = express();
app.use(cors());
app.use(bodyParser());

setupSwagger(app);

app.use('/api/v1', router)

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected!");
    app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
  })
  .catch((error) => console.error("❌ Database connection error:", error));