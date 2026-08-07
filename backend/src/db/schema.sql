-- =========================================================
-- TEHTÄVIENHALLINTASOVELLUS – TIETOKANTASKEEMA
-- =========================================================
-- Entiteetit: users, teams, team_members, projects, sprints,
--             tasks, comments, attachments
-- =========================================================

PRAGMA foreign_keys = ON;

-- Käyttäjät
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tiimit
CREATE TABLE IF NOT EXISTS teams (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tiimin jäsenyys + rooli (many-to-many users <-> teams)
CREATE TABLE IF NOT EXISTS team_members (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id  INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role     TEXT NOT NULL CHECK (role IN ('admin','jasen')) DEFAULT 'jasen',
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (team_id, user_id)
);

-- Projektit (kuuluvat tiimille)
CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id     INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sprintit (kuuluvat projektille) - Scrum-vaatimus
CREATE TABLE IF NOT EXISTS sprints (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date   TEXT NOT NULL,
    status     TEXT NOT NULL CHECK (status IN ('suunniteltu','kaynnissa','valmis')) DEFAULT 'suunniteltu'
);

-- Tehtävät / tiketit
CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id   INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL CHECK (status IN ('backlog','todo','in_progress','review','done')) DEFAULT 'backlog',
    priority    TEXT NOT NULL CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Kommentit tehtäviin/tiketteihin
CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id    INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Liitteet tehtäviin
CREATE TABLE IF NOT EXISTS attachments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id       INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    file_name     TEXT NOT NULL,
    file_path     TEXT NOT NULL,
    uploaded_by   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indeksit hakujen nopeuttamiseksi
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
