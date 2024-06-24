export const environment = {
  production: true,
  createTableSchema: `
    CREATE TABLE IF NOT EXISTS stack (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT NOT NULL,
      translation TEXT NOT NULL,
      description TEXT,
      stack_id INTEGER NOT NULL,
      FOREIGN KEY(stack_id) REFERENCES stack(id)
    );
    CREATE TABLE IF NOT EXISTS language (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS course (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_language_id INTEGER NOT NULL,
      target_language_id INTEGER NOT NULL,
      use_target_language INTEGER NOT NULL CHECK (use_target_language IN (0, 1)),
      use_source_language INTEGER NOT NULL CHECK (use_source_language IN (0, 1)),
      pot_stack_id INTEGER NOT NULL,
      failed_stack_id INTEGER NOT NULL,
      success_stack_id INTEGER NOT NULL,
      FOREIGN KEY (source_language_id) REFERENCES language(id),
      FOREIGN KEY (target_language_id) REFERENCES language(id),
      FOREIGN KEY (pot_stack_id) REFERENCES stack(id),
      FOREIGN KEY (failed_stack_id) REFERENCES stack(id),
      FOREIGN KEY (success_stack_id) REFERENCES stack(id)
  );
  `,
};
