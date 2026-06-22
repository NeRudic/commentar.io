export const initSQL: string = `
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  home_page TEXT
);

CREATE TABLE IF NOT EXISTS comment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  parent_comment_id INTEGER,
  user_email TEXT NOT NULL,
  file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT parent_comment_fk FOREIGN KEY (parent_comment_id)
    REFERENCES comment(id) ON DELETE CASCADE,
  CONSTRAINT user_email_fk FOREIGN KEY (user_email)
    REFERENCES user(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_parent ON comment(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_email ON comment(user_email);
CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
`;
