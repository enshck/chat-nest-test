import { config } from 'dotenv';

config();

export default {
  port: process.env.PORT,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
};
