import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { today } from "./domain.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { dirname } from "node:path";
import { storage } from "./storage.js";
export const databaseContext = new AsyncLocalStorage();
const schema = `
CREATE TABLE IF NOT EXISTS Users (id TEXT PRIMARY KEY, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS Profiles (user_id TEXT PRIMARY KEY REFERENCES Users(id), name TEXT NOT NULL, role TEXT, bio TEXT, xp INTEGER DEFAULT 0, onboarded INTEGER DEFAULT 0, daily_minutes INTEGER DEFAULT 60, assessment TEXT DEFAULT '{}', preferences TEXT DEFAULT '{}');
CREATE TABLE IF NOT EXISTS Stats (id TEXT PRIMARY KEY, user_id TEXT REFERENCES Users(id), name TEXT NOT NULL, description TEXT, xp INTEGER DEFAULT 0, color TEXT, icon TEXT);
CREATE TABLE IF NOT EXISTS Skills (id TEXT PRIMARY KEY, user_id TEXT REFERENCES Users(id), name TEXT NOT NULL, description TEXT, xp INTEGER DEFAULT 0, color TEXT, icon TEXT, stat_ids TEXT DEFAULT '[]');
CREATE TABLE IF NOT EXISTS SkillProgress (id INTEGER PRIMARY KEY, skill_id TEXT REFERENCES Skills(id) ON DELETE CASCADE, xp INTEGER, recorded_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS Goals (id TEXT PRIMARY KEY, user_id TEXT REFERENCES Users(id), title TEXT NOT NULL, description TEXT, category TEXT, target_date TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS Milestones (id TEXT PRIMARY KEY, goal_id TEXT REFERENCES Goals(id) ON DELETE CASCADE, title TEXT NOT NULL, completed INTEGER DEFAULT 0, position INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS Quests (id TEXT PRIMARY KEY, user_id TEXT REFERENCES Users(id), title TEXT NOT NULL, description TEXT, type TEXT, skill_id TEXT REFERENCES Skills(id) ON DELETE SET NULL, stat_ids TEXT DEFAULT '[]', xp INTEGER DEFAULT 30, minutes INTEGER DEFAULT 30, difficulty TEXT, due_date TEXT, completed_at TEXT, goal_id TEXT REFERENCES Goals(id) ON DELETE SET NULL, milestone_id TEXT REFERENCES Milestones(id) ON DELETE SET NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS QuestCompletions (id TEXT PRIMARY KEY, quest_id TEXT REFERENCES Quests(id) ON DELETE SET NULL, title TEXT, xp INTEGER, minutes INTEGER, completed_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS XPTransactions (id INTEGER PRIMARY KEY, user_id TEXT REFERENCES Users(id), completion_id TEXT REFERENCES QuestCompletions(id), entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, amount INTEGER NOT NULL, reason TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS DailyActivity (date TEXT PRIMARY KEY, xp INTEGER DEFAULT 0, minutes INTEGER DEFAULT 0, quests INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS Achievements (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, metric TEXT, target INTEGER);
CREATE TABLE IF NOT EXISTS UserAchievements (achievement_id TEXT PRIMARY KEY REFERENCES Achievements(id), user_id TEXT REFERENCES Users(id), unlocked_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS AIRecommendations (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, quest TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS AIConversations (id INTEGER PRIMARY KEY, user_id TEXT REFERENCES Users(id), role TEXT NOT NULL, content TEXT NOT NULL, action TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ProgressEvents (id TEXT PRIMARY KEY, event_type TEXT NOT NULL, title TEXT NOT NULL, description TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS xp_date ON XPTransactions(created_at);
CREATE INDEX IF NOT EXISTS quest_date ON Quests(due_date);
`;
export function openDatabase(path) {
  mkdirSync(dirname(path), { recursive: true });
  const connection = new Database(path);
  connection.pragma("journal_mode = WAL");
  connection.pragma("foreign_keys = ON");
  connection.pragma("synchronous = FULL");
  connection.pragma("busy_timeout = 5000");
  connection.exec(schema);
  return connection;
}
export const primaryDatabase = openDatabase(storage.databasePath);
export const db = new Proxy(
  {},
  {
    get(_target, property) {
      const connection =
        databaseContext.getStore()?.database || primaryDatabase;
      const value = connection[property];
      return typeof value === "function" ? value.bind(connection) : value;
    },
  },
);
const uid = "local";
const ago = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};
export function seed() {
  if (db.prepare("SELECT id FROM Users LIMIT 1").get()) return;
  db.transaction(() => {
    db.prepare("INSERT INTO Users VALUES (?,?)").run(
      uid,
      new Date().toISOString(),
    );
    db.prepare(
      "INSERT INTO Profiles (user_id,name,role,bio,xp) VALUES (?,?,?,?,?)",
    ).run(
      uid,
      "Alex Morgan",
      "Lifelong learner",
      "A little better, every day.",
      26740,
    );
    const stats = [
      [
        "discipline",
        "Discipline",
        "Show up for yourself.",
        1120,
        "#c2ed93",
        "Flame",
      ],
      [
        "intellect",
        "Intellect",
        "Keep your curiosity alive.",
        1830,
        "#a9baff",
        "Brain",
      ],
      ["body", "Body", "Move, recover, grow.", 880, "#efbc8e", "Activity"],
      [
        "creativity",
        "Creativity",
        "Make something your own.",
        1460,
        "#c7a5ed",
        "Palette",
      ],
      [
        "communication",
        "Communication",
        "Connect with the world.",
        1070,
        "#89cfcd",
        "MessagesSquare",
      ],
      [
        "career",
        "Career",
        "Build a meaningful career.",
        1620,
        "#9db8ee",
        "BriefcaseBusiness",
      ],
      [
        "capital",
        "Capital",
        "Create lasting independence.",
        520,
        "#d8ca88",
        "Wallet",
      ],
      [
        "focus",
        "Focus",
        "Give your attention intention.",
        960,
        "#d9a3b8",
        "Crosshair",
      ],
      [
        "exploration",
        "Exploration",
        "Follow the unfamiliar.",
        1380,
        "#9ccea9",
        "Compass",
      ],
    ];
    const st = db.prepare("INSERT INTO Stats VALUES (?,?,?,?,?,?,?)");
    stats.forEach(([id, name, desc, xp, color, icon]) =>
      st.run(id, uid, name, desc, xp, color, icon),
    );
    const skills = [
      [
        "programming",
        "Programming",
        "Building ideas with code.",
        6890,
        "#a9baff",
        "Code2",
        ["intellect", "career"],
      ],
      [
        "english",
        "English",
        "A world of conversations.",
        5305,
        "#e2c391",
        "Languages",
        ["communication", "intellect"],
      ],
      [
        "piano",
        "Piano",
        "A little practice. A little harmony.",
        1685,
        "#c7a5ed",
        "Piano",
        ["creativity"],
      ],
      [
        "running",
        "Running",
        "One step further.",
        2270,
        "#a8d29b",
        "Footprints",
        ["body", "discipline"],
      ],
      [
        "reading",
        "Reading",
        "New pages, new perspectives.",
        3140,
        "#89cfcd",
        "BookOpen",
        ["intellect"],
      ],
      [
        "finance",
        "Finance",
        "Investing in the future.",
        1160,
        "#d8ca88",
        "Wallet",
        ["capital"],
      ],
    ];
    const sk = db.prepare("INSERT INTO Skills VALUES (?,?,?,?,?,?,?,?)");
    skills.forEach(([id, n, d, x, c, i, s]) =>
      sk.run(id, uid, n, d, x, c, i, JSON.stringify(s)),
    );
    const goals = [
      [
        "developer",
        "Become a full-stack developer",
        "Turn your curiosity into a career.",
        "Career",
        ago(-100),
        [
          "Learn the fundamentals",
          "Build a responsive website",
          "Master APIs & databases",
          "Ship a portfolio project",
          "Apply for your first role",
        ],
      ],
      [
        "english-b2",
        "Reach B2 in English",
        "Express yourself with confidence.",
        "Communication",
        ago(-180),
        [
          "Build a daily vocabulary habit",
          "Finish an intermediate course",
          "Have 20 real conversations",
          "Complete a B2 practice test",
        ],
      ],
      [
        "run10",
        "Run your first 10K",
        "Build endurance at your own pace.",
        "Body",
        ago(-75),
        [
          "Run 3 km comfortably",
          "Build a weekly running routine",
          "Complete your first 5K",
          "Run 10 km",
        ],
      ],
    ];
    goals.forEach(([id, t, d, c, date, ms]) => {
      db.prepare("INSERT INTO Goals VALUES (?,?,?,?,?,?,?)").run(
        id,
        uid,
        t,
        d,
        c,
        date,
        ago(30),
      );
      ms.forEach((m, i) =>
        db
          .prepare("INSERT INTO Milestones VALUES (?,?,?,?,?)")
          .run(`${id}-${i}`, id, m, i < 2 ? 1 : 0, i),
      );
    });
    const quests = [
      [
        "q1",
        "Solve one algorithm problem",
        "A little problem-solving goes a long way.",
        "Daily",
        "programming",
        ["intellect", "career"],
        60,
        35,
        "Moderate",
        null,
      ],
      [
        "q2",
        "Read 20 pages",
        "Make room for a new perspective.",
        "Daily",
        "reading",
        ["intellect", "focus"],
        30,
        25,
        "Easy",
        null,
      ],
      [
        "q3",
        "Go for a 3 km run",
        "Find your pace. Enjoy the process.",
        "Daily",
        "running",
        ["body", "discipline"],
        50,
        30,
        "Moderate",
        null,
      ],
      [
        "q4",
        "Practice English conversation",
        "Speak out loud for 20 minutes.",
        "Daily",
        "english",
        ["communication"],
        35,
        20,
        "Easy",
        "done",
      ],
      [
        "q5",
        "Practice piano",
        "Spend some time with your favorite song.",
        "Daily",
        "piano",
        ["creativity", "focus"],
        40,
        30,
        "Moderate",
        "done",
      ],
      [
        "q6",
        "Build a personal portfolio",
        "A home for the work you are proud of.",
        "Main",
        "programming",
        ["career", "creativity"],
        150,
        90,
        "Challenging",
        null,
      ],
      [
        "q7",
        "Complete three focused study sessions",
        "Protect a little space for deep work.",
        "Weekly",
        "programming",
        ["focus", "discipline"],
        100,
        120,
        "Challenging",
        null,
      ],
    ];
    quests.forEach(([id, t, d, type, sk, st, x, m, diff, done]) =>
      db
        .prepare(
          "INSERT INTO Quests (id,user_id,title,description,type,skill_id,stat_ids,xp,minutes,difficulty,due_date,completed_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        )
        .run(
          id,
          uid,
          t,
          d,
          type,
          sk,
          JSON.stringify(st),
          x,
          m,
          diff,
          today(),
          done ? new Date().toISOString() : null,
          ago(1),
        ),
    );
    const vals = [
      120, 90, 160, 0, 105, 145, 80, 100, 140, 85, 180, 125, 160, 110, 135, 80,
      155, 120, 195, 130, 160, 210, 145, 190, 125, 220, 175, 75,
    ];
    vals.forEach((x, i) => {
      const date = ago(vals.length - 1 - i);
      if (!x) return;
      const mins = Math.round(x * 0.8);
      const c = `seed-${i}`;
      db.prepare("INSERT INTO DailyActivity VALUES (?,?,?,?)").run(
        date,
        x,
        mins,
        i === 27 ? 2 : 3,
      );
      db.prepare("INSERT INTO QuestCompletions VALUES (?,?,?,?,?,?)").run(
        c,
        null,
        i === 27
          ? "English conversation & piano practice"
          : "Daily learning and practice",
        x,
        mins,
        `${date}T09:00:00.000Z`,
      );
      db.prepare(
        "INSERT INTO XPTransactions (user_id,completion_id,entity_type,entity_id,amount,reason,created_at) VALUES (?,?,?,?,?,?,?)",
      ).run(
        uid,
        c,
        "overall",
        uid,
        x,
        "Daily learning and practice",
        `${date}T09:00:00.000Z`,
      );
      db.prepare(
        "INSERT INTO XPTransactions (user_id,completion_id,entity_type,entity_id,amount,reason,created_at) VALUES (?,?,?,?,?,?,?)",
      ).run(
        uid,
        c,
        "skill",
        i % 3 === 0 ? "english" : "programming",
        x,
        "Daily learning and practice",
        `${date}T09:00:00.000Z`,
      );
    });
    const achievements = [
      [
        "first-step",
        "The first step",
        "Complete your first meaningful action.",
        "quests",
        1,
      ],
      [
        "consistent",
        "Showing up",
        "Build a 7-day activity streak.",
        "streak",
        7,
      ],
      [
        "30days",
        "Quiet consistency",
        "Keep learning for 30 consecutive days.",
        "streak",
        30,
      ],
      [
        "100hours",
        "100 hours of growth",
        "Spend 100 hours on your development.",
        "minutes",
        6000,
      ],
      [
        "100actions",
        "Small actions, big change",
        "Complete 100 real-world actions.",
        "quests",
        100,
      ],
      [
        "first-goal",
        "From intention to reality",
        "Complete your first long-term goal.",
        "goals",
        1,
      ],
    ];
    const ac = db.prepare("INSERT INTO Achievements VALUES (?,?,?,?,?)");
    achievements.forEach((a) => ac.run(...a));
    db.prepare("INSERT INTO UserAchievements VALUES (?,?,?)").run(
      "first-step",
      uid,
      ago(27),
    );
    db.prepare("INSERT INTO UserAchievements VALUES (?,?,?)").run(
      "consistent",
      uid,
      ago(18),
    );
  })();
}
seed();
