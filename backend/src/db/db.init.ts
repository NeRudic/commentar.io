import { db } from "../../app.js";

export const sql = `
CREATE TABLE IF NOT EXISTS family (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adult_role (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS child_role (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS adult (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  family_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,

  CONSTRAINT family_id_fk FOREIGN KEY (family_id) REFERENCES family(id) ON DELETE CASCADE,
  CONSTRAINT adult_role_id_fk FOREIGN KEY (role_id) REFERENCES adult_role(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS phone (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL,
  family_id INTEGER NOT NULL,
  adult_id INTEGER,

  CONSTRAINT family_id_fk_to_phone FOREIGN KEY (family_id) REFERENCES family(id) ON DELETE CASCADE,
  CONSTRAINT adult_id_fk FOREIGN KEY (adult_id) REFERENCES adult(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS child (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  birthday TEXT NOT NULL,
  role_id INTEGER NOT NULL,
  family_id INTEGER NOT NULL,

  CONSTRAINT family_id_fk_to_child FOREIGN KEY (family_id) REFERENCES family(id) ON DELETE CASCADE,
  CONSTRAINT role_id_fk_to_child FOREIGN KEY (role_id) REFERENCES child_role(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS visit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brought_by_adult_id INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  price_per_hour INTEGER NOT NULL,

  CONSTRAINT adult_id_fk_visit FOREIGN KEY (brought_by_adult_id) REFERENCES adult(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS child_visit (
  child_id INTEGER NOT NULL,
  visit_id INTEGER NOT NULL,
  PRIMARY KEY (child_id, visit_id),

  CONSTRAINT child_id_child_visit FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
  CONSTRAINT visit_id_child_visit FOREIGN KEY (visit_id) REFERENCES visit(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pricing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  current_price_per_hour INTEGER NOT NULL 
);

CREATE INDEX IF NOT EXISTS idx_family_name ON family(family_name);

CREATE INDEX IF NOT EXISTS idx_adult_family_id ON adult(family_id);
CREATE INDEX IF NOT EXISTS idx_adult_first_name ON adult(first_name);

CREATE INDEX IF NOT EXISTS idx_phone_family_id ON phone(family_id);
CREATE INDEX IF NOT EXISTS idx_phone_adult_id ON phone(adult_id);

CREATE INDEX IF NOT EXISTS idx_child_visit_child ON child_visit(child_id);

CREATE INDEX IF NOT EXISTS idx_child_first_name ON child(first_name);

INSERT OR IGNORE INTO adult_role (role) VALUES

('Мати'),
('Батько'),
('Дідусь'),
('Бабуся');

INSERT OR IGNORE INTO child_role (role) VALUES

('Син'),
('Донька'),
('Онук'),
('Онучка');

`;

export default async function initDB() {
  await db.exec(sql);
}
