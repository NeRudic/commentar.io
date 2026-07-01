export const initSQL: string = `
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  home_page TEXT
);

CREATE TABLE IF NOT EXISTS comment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  parent_comment_id INTEGER,
  text TEXT NOT NULL,
  user_email TEXT NOT NULL,
  file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT parent_comment_fk FOREIGN KEY (parent_comment_id)
    REFERENCES comment(id) ON DELETE CASCADE,
  CONSTRAINT user_email_fk FOREIGN KEY (user_email)
    REFERENCES user(email) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS file (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending', 'published')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parent_comments ON comment(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_email ON comment(user_email);
CREATE INDEX IF NOT EXISTS idx_comment_post_id ON comment(post_id);
`;
