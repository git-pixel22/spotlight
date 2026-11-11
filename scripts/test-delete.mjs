// Dev only: creates a throwaway user with a photo and tokens, deletes it via the API, checks it's gone.
import { neon } from "@neondatabase/serverless";
import { put, list } from "@vercel/blob";
import { sealData } from "iron-session";
import { readFileSync } from "node:fs";
const sql = neon(process.env.DATABASE_URL);
const base = process.argv[2];
const [u] = await sql`insert into users (buffer_account_id, organization_id, name) values (${"test-" + Date.now()}, 'test-org', 'Delete Test') returning id`;
await sql`insert into buffer_tokens (user_id, access_token_enc, expires_at) values (${u.id}, 'x.y.z', now() + interval '1 hour')`;
await sql`insert into moments (user_id, source, title, question) values (${u.id}, 'voice', 'Test', 'Test?')`;
await put(`users/${u.id}/photo.jpg`, readFileSync("public/landing/barber.jpg"), { access: "public", addRandomSuffix: true });
const before = (await list({ prefix: `users/${u.id}/` })).blobs.length;
const cookie = await sealData({ userId: u.id }, { password: process.env.SESSION_PASSWORD, ttl: 600 });
const res = await fetch(`${base}/api/account/delete`, { method: "POST", headers: { cookie: `spotlight_session=${cookie}` }, redirect: "manual" });
const after = (await list({ prefix: `users/${u.id}/` })).blobs.length;
const rows = await sql`select (select count(*) from users where id=${u.id}) u, (select count(*) from buffer_tokens where user_id=${u.id}) t, (select count(*) from moments where user_id=${u.id}) m`;
console.log({ status: res.status, location: res.headers.get("location"), blobsBefore: before, blobsAfter: after, rows: rows[0] });
