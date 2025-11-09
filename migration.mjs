import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("focus.db");
const schema = fs.readFileSync("db/schema.sql", "utf-8");
db.exec(schema);
console.log("migration complete");
