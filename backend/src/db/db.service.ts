import * as _sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { runResponse } from './db.types';

const sqlite3 = _sqlite3.verbose();

@Injectable()
export class DB {
  private db: Database | null;

  constructor() {
    this.db = null;
  }

  connect(DB_PATH: string): Promise<void> {
    return new Promise((res, rej) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Database connection error:', err.message);
          return rej(err);
        } else {
          console.log('Database connected');
          res();
        }
      });
      this.db.run('PRAGMA foreign_keys = ON;');
    });
  }

  // Для множественных запросов (CREATE TABLE, миграции и т.д.) — без параметров
  exec(sql: string): Promise<void> {
    return new Promise<void>((res, rej) => {
      this.db!.exec(sql, (err) => (err ? rej(err) : res()));
    });
  }

  // Данный кусок кода использует C-style, и мне сильно помог с ним ИИ, я еле понял суть. Если честно, мне сложно понять такой стиль, поэтому скорее всего я не смогу полноценно ответить по этому куску(речь о блоке else)
  run(sql: string, params: any = []): Promise<runResponse> {
    return new Promise((res, rej) => {
      this.db!.run(sql, params, function (err) {
        if (err) rej(err);
        else res({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get<T = unknown>(sql: string, params?: any): Promise<T> {
    return new Promise((res, rej) => {
      this.db!.get(sql, params, (err, row: T) => (err ? rej(err) : res(row)));
    });
  }

  all<T = unknown>(sql: string, params: any = []): Promise<T[]> {
    return new Promise((res, rej) => {
      this.db!.all(sql, params, (err, rows: T[]) =>
        err ? rej(err) : res(rows),
      );
    });
  }

  close(): Promise<string> {
    return new Promise((res, rej) => {
      this.db!.close((err) => (err ? rej(err) : res('Database was closed!')));
    });
  }
}
