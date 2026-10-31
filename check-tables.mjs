import dotenv from "dotenv";
dotenv.config();
import mariadb from "mariadb";

async function checkTables() {
  const url = new URL(process.env.DATABASE_URL);
  const conn = await mariadb.createConnection({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
    connectTimeout: 5000,
  });

  const tables = await conn.query("SHOW TABLES");
  console.log("Tables in database:", tables);
  await conn.end();
}

checkTables().catch(console.error);

