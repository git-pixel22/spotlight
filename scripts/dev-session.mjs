// Dev only: prints a session cookie for the first user, for testing API routes with curl.
import { sealData } from "iron-session";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const [u] = await sql`select id from users order by created_at limit 1`;
console.log(await sealData({ userId: u.id }, { password: process.env.SESSION_PASSWORD, ttl: 3600 }));
