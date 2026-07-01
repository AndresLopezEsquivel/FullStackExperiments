import pg from 'pg';

const { Pool } = pg;

// Enable TLS when asked (local Postgres usually runs without it, Amazon RDS
// expects it). rejectUnauthorized:false gets a connection up quickly; for
// production, tighten this to verify against the downloaded RDS CA bundle:
//   ssl: { ca: readFileSync('rds-ca.pem'), rejectUnauthorized: true }
const ssl =
  process.env.PGSSLMODE === 'require' || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false;

// When DATABASE_URL is set we use it; otherwise pg falls back to the standard
// PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE env vars (libpq defaults).
export const pool = new Pool({
  ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {}),
  ssl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
