import dotenv from "dotenv";
dotenv.config();

import mariadb from "mariadb";

async function testConnection() {
  const url = new URL(process.env.DATABASE_URL);
  console.log("Testing connection to:", url.hostname, "on port:", url.port || 3306);

  // Test 1: with ssl: { rejectUnauthorized: false }
  console.log("\n--- Test 1: mariadb with rejectUnauthorized: false ---");
  try {
    const conn = await mariadb.createConnection({
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
      connectTimeout: 5000,
    });
    console.log("✅ Test 1 Success! Connected to database!");
    const res = await conn.query("SELECT 1 + 1 AS result");
    console.log("Query result:", res);
    await conn.end();
    return;
  } catch (err) {
    console.log("❌ Test 1 Failed:", err.message);
  }

  // Test 2: with ssl: true
  console.log("\n--- Test 2: mariadb with ssl: true ---");
  try {
    const conn = await mariadb.createConnection({
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: true,
      connectTimeout: 5000,
    });
    console.log("✅ Test 2 Success! Connected with ssl: true!");
    await conn.end();
    return;
  } catch (err) {
    console.log("❌ Test 2 Failed:", err.message);
  }

  // Test 3: with mysql2
  console.log("\n--- Test 3: mysql2 ---");
  try {
    const mysql2 = await import("mysql2/promise");
    const conn = await mysql2.createConnection({
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
      connectTimeout: 5000,
    });
    console.log("✅ Test 3 Success with mysql2!");
    await conn.end();
    return;
  } catch (err) {
    console.log("❌ Test 3 Failed:", err.message);
  }
}

testConnection();

