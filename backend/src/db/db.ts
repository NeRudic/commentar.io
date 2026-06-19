import sqlite3, {Database} from "sqlite3";
import "dotenv/config";

const verbose = sqlite3.verbose;
verbose();

export class DB {
  private path: string;
  private db: Database | null;

  constructor(DB_PATH: string) {
    this.path = DB_PATH;
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.path, (err) => {
        if (err) {
          console.error("Database connection error:", err.message);
          return reject(err);
        } else {
          console.log("Database connected");
          resolve();
        }
      });
      this.db.run("PRAGMA foreign_keys = ON;");
    });
  }

  // Для множественных запросов (CREATE TABLE, миграции и т.д.) — без параметров
  exec(sql) {
    return new Promise((res, rej) => {
      this.db.exec(sql, (err) => {
        err ? rej(err) : res();
      });
    });
  }

  // Для одиночных запросов с параметрами (INSERT, UPDATE, DELETE)
  run(sql, params = []) {
    return new Promise((res, rej) => {
      this.db.run(sql, params, function (err) {
        err ? rej(err) : res({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params) {
    return new Promise((res, rej) => {
      this.db.get(sql, params, (err, row) => {
        err ? rej(err) : res(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((res, rej) => {
      this.db.all(sql, params, (err, rows) => {
        err ? rej(err) : res(rows);
      });
    });
  }

  close() {
    return new Promise((res, rej) => {
      this.db.close((err) => {
        err ? rej(err) : res("Database was closed!");
      });
    });
  }
}
