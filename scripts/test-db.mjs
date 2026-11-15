import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const { withTransaction, query, readQuery } = await import("../lib/db.js");
const sql = {};
for (const name of ["category", "tag", "state", "delete-category", "delete-tag"]) {
  sql[name] = await readFile(new URL("../database/tests/transaction-" + name + ".sql", import.meta.url), "utf8");
}
const marker = "uji-transaksi-" + Date.now();
try {
  const constraintPool = new pg.Pool({ connectionTimeoutMillis: 5000 });
  try {
    await constraintPool.query(await readFile(new URL("../database/tests/constraints.sql", import.meta.url), "utf8"));
  } finally {
    await constraintPool.end();
  }
  await withTransaction(async (client) => {
    await client.query(sql.category, [marker]);
    await client.query(sql.tag, [marker]);
  });
  await withTransaction(async (client) => {
    assert.deepEqual((await client.query(sql.state, [marker])).rows[0], { categories: 1, tags: 1 });
  });
  await assert.rejects(withTransaction(async (client) => {
    await client.query(sql.category, [marker + "-batal"]);
    await client.query(sql.tag, [marker + "-batal"]);
    throw new Error("Batalkan operasi");
  }), /Batalkan operasi/);
  await withTransaction(async (client) => {
    assert.deepEqual((await client.query(sql.state, [marker + "-batal"])).rows[0], { categories: 0, tags: 0 });
  });
  await assert.rejects(readQuery("../schema"), /tidak terdaftar/);
  assert.equal((await query("preview", [2])).rows.length, 2);
  console.log("Lulus: 16 constraint, transaksi dua tabel, parameter SQL, dan daftar query.");
} finally {
  if (globalThis.artShowcasePool) {
    await withTransaction(async (client) => {
      for (const value of [marker, marker + "-batal"]) {
        await client.query(sql["delete-category"], [value]);
        await client.query(sql["delete-tag"], [value]);
      }
    });
    await globalThis.artShowcasePool.end();
  }
}
