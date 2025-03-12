import sql from 'msnodesqlv8';
import dotenv from 'dotenv';

dotenv.config();

// Connection string from environment variables
const connectionString = process.env.DB_CONNECTION_STRING || "server=.;Database=hosco_shop;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";

export const executeQuery = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    sql.query(connectionString, query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
