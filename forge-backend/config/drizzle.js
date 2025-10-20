/**
 * PostgreSQL database config (Drizzle ORM)
 */

require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  ssl: {
    rejectUnauthorized: false
  },
  
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const db = drizzle(pool);

module.exports = { db };
