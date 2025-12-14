import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const requiredVars = ["DB_URI", "DB_NAME", "PORT"];

requiredVars.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`The required variable not available : ${key}`);
  }
});

export const ENV = {
  dbUri: process.env.DB_URI,
  dbName: process.env.DB_NAME,
  port: process.env.PORT,
};
