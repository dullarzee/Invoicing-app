// test-pg.js
const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.SUPABASE_URL,
});

client
  .connect()
  .then(() => {
    console.log("✓ Connection successful!");
    return client.query("SELECT NOW()");
  })
  .then((result) => {
    console.log("✓ Database time:", result.rows[0]);
    client.end();
  })
  .catch((err) => {
    console.error("✗ Connection failed:", err.message);
  });
