import express from "express";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "./db.js";
import {
  today,
  levelInfo,
  rewardFor,
  suggestAction,
  getStreak,
} from "./domain.js";
const app = express();
app.use(express.json({ limit: "100kb" }));
const all = (sql, ...args) => db.prepare(sql).all(...args);
const get = (sql, ...args) => db.prepare(sql).get(...args);
const run = (sql, ...args) => db.prepare(sql).run(...args);
const stamp = () => new Date().toISOString();
function requireText(value, field = "Title") {
  if (typeof value !== "string" || !value.trim() || value.length > 500)
    throw new Error(`${field} must contain between 1 and 500 characters.`);
  return value.trim();
}
function number(value, min, max, fallback) {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n) || n < min || n > max)
    throw new Error(`Value must be between ${min} and ${max}.`);
  return Math.round(n);
}
function entities() {
  return {
    skills: all("SELECT * FROM Skills").map((s) => ({
      ...s,
      statIds: JSON.parse(s.stat_ids),
      ...levelInfo(s.xp),
      totalXp: s.xp,
    })),
    stats: all("SELECT * FROM Stats").map((s) => ({
      ...s,
      ...levelInfo(s.xp, 200),
      totalXp: s.xp,
    })),
  };
}
function suggestion() {
  const { skills, stats } = entities();
  const counts = all(
    "SELECT entity_id, SUM(amount) xp FROM XPTransactions WHERE entity_type='skill' AND created_at >= ? GROUP BY entity_id",
    new Date(Date.now() - 7 * 86400000).toISOString(),
  );
  const skill = [...skills].sort(
    (a, b) =>
      (counts.find((x) => x.entity_id === a.id)?.xp || 0) -
      (counts.find((x) => x.entity_id === b.id)?.xp || 0),
  )[0];
  if (!skill) return null;
  const daily = get("SELECT daily_minutes FROM Profiles").daily_minutes;
  const pending = all(
    "SELECT * FROM Quests WHERE due_date < ? AND completed_at IS NULL",
    today(),
  ).length;
  const minutes = Math.min(daily, pending > 3 ? 15 : 25);
  return {
    title: `Make a little room for ${skill.name.toLowerCase()}`,
    description: `${skill.name} has received less attention this week. A ${minutes}-minute session is a small, achievable next step.`,
    quest: {
      title: `Practice ${skill.name.toLowerCase()} for ${minutes} minutes`,
      minutes,
      xp: Math.round(minutes * 1.4),
      skillId: skill.id,
      statIds: skill.statIds,
      type: "AI Suggested",
      difficulty: "Easy",
    },
  };
}
function state() {
  const profile = get("SELECT * FROM Profiles");
  const daily = all("SELECT * FROM DailyActivity ORDER BY date");
  const streak = getStreak(daily.map((d) => d.date));
  const goals = all("SELECT * FROM Goals").map((g) => ({
    ...g,
    milestones: all(
      "SELECT * FROM Milestones WHERE goal_id=? ORDER BY position",
      g.id,
    ),
  }));
  const totals = daily.reduce(
    (a, d) => ({
      xp: a.xp + d.xp,
      minutes: a.minutes + d.minutes,
      quests: a.quests + d.quests,
    }),
    { xp: 0, minutes: 0, quests: 0 },
  );
  const metrics = {
    ...totals,
    streak,
    goals: goals.filter(
      (g) => g.milestones.length && g.milestones.every((m) => m.completed),
    ).length,
  };
  all("SELECT * FROM Achievements").forEach((a) => {
    if ((metrics[a.metric] || 0) >= a.target)
      run(
        "INSERT OR IGNORE INTO UserAchievements VALUES (?,?,?)",
        a.id,
        "local",
        stamp(),
      );
  });
  return {
    profile: {
      ...profile,
      ...levelInfo(profile.xp, 1000),
      totalXp: profile.xp,
      assessment: JSON.parse(profile.assessment),
      preferences: JSON.parse(profile.preferences),
    },
    ...entities(),
    quests: all("SELECT * FROM Quests ORDER BY created_at,id").map((q) => ({
      ...q,
      statIds: JSON.parse(q.stat_ids),
    })),
    goals,
    daily,
    streak,
    totals,
    transactions: all(
      "SELECT * FROM XPTransactions ORDER BY created_at DESC,id DESC LIMIT 500",
    ),
    completions: all(
      "SELECT * FROM QuestCompletions ORDER BY completed_at DESC LIMIT 200",
    ),
    achievements: all(
      "SELECT a.*,u.unlocked_at FROM Achievements a LEFT JOIN UserAchievements u ON a.id=u.achievement_id",
    ).map((a) => ({
      ...a,
      current: Math.min(metrics[a.metric] || 0, a.target),
    })),
    recommendation: suggestion(),
    conversations: all("SELECT * FROM AIConversations ORDER BY id").map(
      (c) => ({ ...c, action: c.action ? JSON.parse(c.action) : null }),
    ),
    aiMode:
      process.env.AI_API_KEY && process.env.AI_API_URL ? "connected" : "local",
  };
}
function addQuest(data) {
  const title = requireText(data.title);
  const skillId =
    data.skillId && get("SELECT id FROM Skills WHERE id=?", data.skillId)
      ? data.skillId
      : null;
  const statIds = Array.isArray(data.statIds)
    ? data.statIds.filter((id) => get("SELECT id FROM Stats WHERE id=?", id))
    : [];
  const type = [
    "Daily",
    "Weekly",
    "Main",
    "Side",
    "AI Suggested",
    "Custom",
  ].includes(data.type)
    ? data.type
    : "Custom";
  const id = randomUUID();
  const due = /^\d{4}-\d{2}-\d{2}$/.test(data.due_date || "")
    ? data.due_date
    : today();
  run(
    "INSERT INTO Quests (id,user_id,title,description,type,skill_id,stat_ids,xp,minutes,difficulty,due_date,goal_id,milestone_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    id,
    "local",
    title,
    String(data.description || "").slice(0, 500),
    type,
    skillId,
    JSON.stringify(statIds),
    number(data.xp, 5, 200, 30),
    number(data.minutes, 1, 480, 30),
    ["Easy", "Moderate", "Challenging"].includes(data.difficulty)
      ? data.difficulty
      : "Moderate",
    due,
    data.goalId || null,
    data.milestoneId || null,
    stamp(),
  );
  return id;
}
const complete = db.transaction((id) => {
  const q = get("SELECT * FROM Quests WHERE id=?", id);
  if (!q) throw new Error("Quest not found.");
  if (q.completed_at) throw new Error("This quest is already complete.");
  const repetitions = get(
    "SELECT COUNT(*) count FROM QuestCompletions WHERE lower(title)=lower(?) AND completed_at>=?",
    q.title,
    today(),
  ).count;
  const xp = rewardFor(q, repetitions);
  const cid = randomUUID();
  const at = stamp();
  const rewards = [];
  run("UPDATE Quests SET completed_at=? WHERE id=?", at, id);
  run(
    "INSERT INTO QuestCompletions VALUES (?,?,?,?,?,?)",
    cid,
    id,
    q.title,
    xp,
    q.minutes,
    at,
  );
  const grant = (type, entityId, amount, table, step) => {
    const before = get(
      `SELECT xp,name FROM ${table} WHERE ${table === "Profiles" ? "user_id" : "id"}=?`,
      entityId,
    );
    if (!before) return;
    run(
      `UPDATE ${table} SET xp=xp+? WHERE ${table === "Profiles" ? "user_id" : "id"}=?`,
      amount,
      entityId,
    );
    run(
      "INSERT INTO XPTransactions (user_id,completion_id,entity_type,entity_id,amount,reason,created_at) VALUES (?,?,?,?,?,?,?)",
      "local",
      cid,
      type,
      entityId,
      amount,
      q.title,
      at,
    );
    rewards.push({
      name: type === "overall" ? "Overall" : before.name,
      xp: amount,
      levelUp:
        Math.floor((before.xp + amount) / step) > Math.floor(before.xp / step),
      level: Math.floor((before.xp + amount) / step) + 1,
    });
  };
  grant("overall", "local", xp, "Profiles", 1000);
  if (q.skill_id) {
    grant("skill", q.skill_id, xp, "Skills", 500);
    run(
      "INSERT INTO SkillProgress (skill_id,xp,recorded_at) VALUES (?,?,?)",
      q.skill_id,
      xp,
      at,
    );
  }
  JSON.parse(q.stat_ids).forEach((s) =>
    grant("stat", s, Math.max(1, Math.round(xp * 0.3)), "Stats", 200),
  );
  run(
    "INSERT INTO DailyActivity VALUES (?,?,?,1) ON CONFLICT(date) DO UPDATE SET xp=xp+excluded.xp,minutes=minutes+excluded.minutes,quests=quests+1",
    today(),
    xp,
    q.minutes,
  );
  if (q.milestone_id)
    run("UPDATE Milestones SET completed=1 WHERE id=?", q.milestone_id);
  return { rewards, xp };
});
app.get("/api/state", (req, res) => res.json(state()));
app.post("/api/quests", (req, res) => {
  const id = addQuest(req.body);
  res.json({ id, state: state() });
});
app.post("/api/quests/:id/complete", (req, res) =>
  res.json({ ...complete(req.params.id), state: state() }),
);
app.delete("/api/quests/:id", (req, res) => {
  run("DELETE FROM Quests WHERE id=? AND completed_at IS NULL", req.params.id);
  res.json(state());
});
app.post("/api/log/preview", (req, res) => {
  const { skills, stats } = entities();
  res.json(
    suggestAction(
      requireText(req.body.text, "Description"),
      skills,
      stats,
      req.body.minutes,
    ),
  );
});
app.post("/api/log/confirm", (req, res) => {
  const result = db.transaction(() =>
    complete(addQuest({ ...req.body, type: "Custom" })),
  )();
  res.json({ ...result, state: state() });
});
for (const [route, table, step] of [
  ["skills", "Skills", 500],
  ["stats", "Stats", 200],
]) {
  app.post(`/api/${route}`, (req, res) => {
    const d = req.body;
    const id = randomUUID();
    const name = requireText(d.name, "Name");
    const level = number(d.level, 1, 100, 1);
    const color = /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#c2ed93";
    if (table === "Skills")
      run(
        "INSERT INTO Skills VALUES (?,?,?,?,?,?,?,?)",
        id,
        "local",
        name,
        String(d.description || "").slice(0, 500),
        (level - 1) * step,
        color,
        "Sparkles",
        JSON.stringify(
          (d.statIds || []).filter((x) =>
            get("SELECT id FROM Stats WHERE id=?", x),
          ),
        ),
      );
    else
      run(
        "INSERT INTO Stats VALUES (?,?,?,?,?,?,?)",
        id,
        "local",
        name,
        String(d.description || "").slice(0, 500),
        (level - 1) * step,
        color,
        "Sparkles",
      );
    run(
      "INSERT INTO XPTransactions (user_id,entity_type,entity_id,amount,reason,created_at) VALUES (?,?,?,?,?,?)",
      "local",
      route === "skills" ? "skill" : "stat",
      id,
      (level - 1) * step,
      "Starting level",
      stamp(),
    );
    res.json(state());
  });
  app.patch(`/api/${route}/:id`, (req, res) => {
    db.transaction(() => {
      const row = get(`SELECT * FROM ${table} WHERE id=?`, req.params.id);
      if (!row) throw new Error("Not found.");
      const name = requireText(req.body.name, "Name");
      const xp = req.body.level
        ? (number(req.body.level, 1, 100, 1) - 1) * step + (row.xp % step)
        : row.xp;
      run(
        `UPDATE ${table} SET name=?, description=?,xp=? WHERE id=?`,
        name,
        String(req.body.description || "").slice(0, 500),
        xp,
        row.id,
      );
      if (table === "Skills" && Array.isArray(req.body.statIds))
        run(
          "UPDATE Skills SET stat_ids=? WHERE id=?",
          JSON.stringify(
            req.body.statIds.filter((x) =>
              get("SELECT id FROM Stats WHERE id=?", x),
            ),
          ),
          row.id,
        );
      if (xp !== row.xp)
        run(
          "INSERT INTO XPTransactions (user_id,entity_type,entity_id,amount,reason,created_at) VALUES (?,?,?,?,?,?)",
          "local",
          route === "skills" ? "skill" : "stat",
          row.id,
          xp - row.xp,
          "Manual level adjustment",
          stamp(),
        );
    })();
    res.json(state());
  });
  app.delete(`/api/${route}/:id`, (req, res) => {
    db.transaction(() => {
      if (table === "Stats") {
        for (const t of ["Skills", "Quests"])
          all(`SELECT id,stat_ids FROM ${t}`).forEach((row) =>
            run(
              `UPDATE ${t} SET stat_ids=? WHERE id=?`,
              JSON.stringify(
                JSON.parse(row.stat_ids).filter((id) => id !== req.params.id),
              ),
              row.id,
            ),
          );
      }
      run(`DELETE FROM ${table} WHERE id=?`, req.params.id);
    })();
    res.json(state());
  });
}
app.post("/api/goals", (req, res) => {
  const id = randomUUID();
  db.transaction(() => {
    run(
      "INSERT INTO Goals VALUES (?,?,?,?,?,?,?)",
      id,
      "local",
      requireText(req.body.title),
      String(req.body.description || ""),
      req.body.category || "Personal",
      req.body.target_date || null,
      stamp(),
    );
    const milestones = req.body.milestones || [
      "Define your starting point",
      "Build a consistent practice",
      "Complete a practical project",
      "Review your progress",
    ];
    if (!Array.isArray(milestones) || milestones.length > 30)
      throw new Error("Choose up to 30 milestones.");
    milestones.forEach((m, i) =>
      run(
        "INSERT INTO Milestones VALUES (?,?,?,?,?)",
        randomUUID(),
        id,
        requireText(m),
        0,
        i,
      ),
    );
  })();
  res.json(state());
});
app.patch("/api/milestones/:id", (req, res) => {
  run(
    "UPDATE Milestones SET completed=? WHERE id=?",
    req.body.completed ? 1 : 0,
    req.params.id,
  );
  res.json(state());
});
app.delete("/api/goals/:id", (req, res) => {
  run("DELETE FROM Goals WHERE id=?", req.params.id);
  res.json(state());
});
app.patch("/api/profile", (req, res) => {
  const p = get("SELECT * FROM Profiles");
  run(
    "UPDATE Profiles SET name=?,role=?,bio=?,daily_minutes=?,preferences=?",
    requireText(req.body.name || p.name, "Name"),
    String(req.body.role ?? p.role).slice(0, 200),
    String(req.body.bio ?? p.bio).slice(0, 500),
    number(req.body.daily_minutes, 5, 480, p.daily_minutes),
    JSON.stringify(req.body.preferences || JSON.parse(p.preferences)),
  );
  res.json(state());
});
app.post("/api/onboarding", (req, res) => {
  const d = req.body;
  db.transaction(() => {
    run("DELETE FROM AIConversations");
    run("DELETE FROM AIRecommendations");
    run("DELETE FROM XPTransactions");
    run("DELETE FROM SkillProgress");
    run("DELETE FROM QuestCompletions");
    run("DELETE FROM DailyActivity");
    run("DELETE FROM Quests");
    run("DELETE FROM Milestones");
    run("DELETE FROM Goals");
    run("DELETE FROM UserAchievements");
    run("DELETE FROM Skills");
    const ratings = {
      discipline: d.experience || 2,
      intellect: d.education || 2,
      body: d.activity || 2,
      creativity: d.creative || 2,
      communication: d.languageLevel || 2,
      career: d.careerLevel || 2,
      capital: d.financeLevel || 2,
      focus: d.experience || 2,
      exploration: d.education || 2,
    };
    let sum = 0;
    all("SELECT id FROM Stats").forEach((s) => {
      const level = number(ratings[s.id], 1, 10, 2);
      sum += level;
      const xp = (level - 1) * 200;
      run("UPDATE Stats SET xp=? WHERE id=?", xp, s.id);
      run(
        "INSERT INTO XPTransactions (user_id,entity_type,entity_id,amount,reason,created_at) VALUES (?,?,?,?,?,?)",
        "local",
        "stat",
        s.id,
        xp,
        "Initial self-assessment",
        stamp(),
      );
    });
    const xp = Math.max(
      0,
      (Math.round(sum / Math.max(1, all("SELECT id FROM Stats").length)) - 1) *
        1000,
    );
    run(
      "UPDATE Profiles SET name=?,role=?,xp=?,onboarded=1,daily_minutes=?,assessment=?",
      requireText(d.name, "Name"),
      d.occupation || "Lifelong learner",
      xp,
      number(d.daily_minutes, 5, 480, 60),
      JSON.stringify(d),
    );
    run(
      "INSERT INTO XPTransactions (user_id,entity_type,entity_id,amount,reason,created_at) VALUES (?,?,?,?,?,?)",
      "local",
      "overall",
      "local",
      xp,
      "Initial self-assessment",
      stamp(),
    );
    String(d.skills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30)
      .forEach((name) => {
        const id = randomUUID();
        const sx = (number(d.experience, 1, 10, 2) - 1) * 500;
        const inferred = suggestAction(name, [], all("SELECT * FROM Stats"));
        run(
          "INSERT INTO Skills VALUES (?,?,?,?,?,?,?,?)",
          id,
          "local",
          name,
          "Your personal learning journey.",
          sx,
          "#a9baff",
          "Sparkles",
          JSON.stringify(inferred.statIds),
        );
        run(
          "INSERT INTO XPTransactions (user_id,entity_type,entity_id,amount,reason,created_at) VALUES (?,?,?,?,?,?)",
          "local",
          "skill",
          id,
          sx,
          "Initial self-assessment",
          stamp(),
        );
      });
    if (d.goal) {
      const id = randomUUID();
      run(
        "INSERT INTO Goals VALUES (?,?,?,?,?,?,?)",
        id,
        "local",
        requireText(d.goal),
        "Your next chapter.",
        "Personal",
        null,
        stamp(),
      );
      [
        "Assess your current experience",
        "Choose a learning resource",
        "Complete your first practice session",
        "Build a weekly routine",
      ].forEach((m, i) =>
        run(
          "INSERT INTO Milestones VALUES (?,?,?,?,?)",
          randomUUID(),
          id,
          m,
          0,
          i,
        ),
      );
    }
    const { skills, stats } = entities();
    addQuest({
      ...suggestAction(
        `Practice ${skills[0]?.name || "a skill you want to learn"} for 20 minutes`,
        skills,
        stats,
      ),
      type: "Daily",
    });
  })();
  res.json(state());
});
app.post("/api/recommendations/:action", (req, res) => {
  const rec = req.body.quest ? req.body : suggestion();
  if (!rec) throw new Error("Add a skill first to get a recommendation.");
  const key = JSON.stringify(rec.quest);
  if (req.params.action === "accept") {
    const existing = get(
      "SELECT id FROM AIRecommendations WHERE quest=? AND status='accepted' AND created_at>=?",
      key,
      today(),
    );
    if (existing)
      throw new Error("This recommendation is already in your quests.");
    addQuest(rec.quest);
  }
  run(
    "INSERT INTO AIRecommendations VALUES (?,?,?,?,?,?)",
    randomUUID(),
    rec.title || rec.quest.title,
    rec.description || "",
    key,
    req.params.action === "accept" ? "accepted" : "skipped",
    stamp(),
  );
  res.json(state());
});
app.post("/api/chat", async (req, res, next) => {
  try {
    const message = requireText(req.body.message, "Message");
    const s = state();
    const estimated = message.match(/(\d+)\s*(?:min|мин)/i);
    const mins = estimated
      ? Math.min(120, Number(estimated[1]))
      : Math.min(30, s.profile.daily_minutes);
    const specific = s.skills.find((sk) =>
      message.toLowerCase().includes(sk.name.toLowerCase()),
    );
    const skill =
      specific ||
      s.skills.find((sk) => sk.id === s.recommendation?.quest.skillId) ||
      s.skills[0];
    let action = skill
      ? {
          title: `Practice ${skill.name.toLowerCase()} for ${mins} minutes`,
          minutes: mins,
          xp: Math.round(mins * 1.3),
          skillId: skill.id,
          statIds: skill.statIds,
          type: "AI Suggested",
          difficulty: "Moderate",
        }
      : null;
    let content;
    if (/analy|progress|slow|month|анализ|прогресс/i.test(message)) {
      const recent = s.daily.filter(
        (d) =>
          d.date >=
          new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
      );
      const xp = recent.reduce((a, d) => a + d.xp, 0),
        minutes = recent.reduce((a, d) => a + d.minutes, 0);
      content = `Over the past 30 days you logged ${xp.toLocaleString()} XP and ${Math.round((minutes / 60) * 10) / 10} hours of development. Your current streak is ${s.streak} days.\n\n${s.recommendation?.description || "Start logging your actions to discover patterns."}\n\nLevels reflect recorded practice, not your worth or ability. If a skill feels slow, try one specific, slightly harder task and record what you learned.`;
    } else if (/plan|roadmap|7.day|план/i.test(message)) {
      content = `Here is a sustainable 7-day plan for ${skill?.name || "your next goal"}, with about ${mins} minutes a day:\n\n1. Assess your starting point and choose one small outcome.\n2. Learn one core concept and take brief notes.\n3. Put it into practice without a tutorial.\n4. Review what was difficult; take a lighter session.\n5. Try a slightly more challenging exercise.\n6. Create something small using what you learned.\n7. Reflect on the week and choose your next step.\n\nAdapt the pace to your energy. Your daily time budget is ${s.profile.daily_minutes} minutes.`;
    } else {
      content = `You have ${s.quests.filter((q) => !q.completed_at && q.due_date === today()).length} open actions today and a ${s.streak}-day streak. ${s.profile.assessment.goal ? `Your priority is “${s.profile.assessment.goal}”. ` : ""}\n\n${skill ? `A focused ${mins}-minute ${skill.name.toLowerCase()} session would be a useful next step. Start with one clear outcome, remove distractions, and write down what you learned.` : "Create your first skill, then choose one small action to practice it."}\n\n${s.quests.filter((q) => !q.completed_at && q.due_date < today()).length > 3 ? "Some tasks are overdue. Reduce the scope today; a short session still counts." : "Consistency matters more than a perfect day. You can adjust this suggestion before adding it."}`;
    }
    let mode = "local";
    if (process.env.AI_API_KEY && process.env.AI_API_URL) {
      const response = await fetch(process.env.AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
        },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          model: process.env.AI_MODEL || "default",
          messages: [
            {
              role: "system",
              content: `You are a supportive personal development assistant. No shame or clinical claims. Respond in the user's language. Suggest sustainable real-world actions. Do not claim to have changed data. User context: ${JSON.stringify({ profile: s.profile, skills: s.skills, stats: s.stats, quests: s.quests, goals: s.goals, daily: s.daily })}`,
            },
            ...s.conversations
              .slice(-10)
              .map((c) => ({ role: c.role, content: c.content })),
            { role: "user", content: message },
          ],
        }),
      });
      if (!response.ok)
        throw new Error(
          "AI provider is unavailable. Your data is saved; try again or disable the provider to use local guidance.",
        );
      const json = await response.json();
      content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI provider returned an empty response.");
      mode = "connected";
      action = null;
    }
    run(
      "INSERT INTO AIConversations (user_id,role,content,created_at) VALUES (?,?,?,?)",
      "local",
      "user",
      message,
      stamp(),
    );
    run(
      "INSERT INTO AIConversations (user_id,role,content,action,created_at) VALUES (?,?,?,?,?)",
      "local",
      "assistant",
      content,
      action ? JSON.stringify(action) : null,
      stamp(),
    );
    res.json({ state: state(), mode });
  } catch (error) {
    next(error);
  }
});
app.get("/api/export", (req, res) => {
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="ascend-data.json"',
  );
  res.json({
    exportedAt: stamp(),
    ...state(),
    transactions: all("SELECT * FROM XPTransactions ORDER BY created_at"),
    completions: all("SELECT * FROM QuestCompletions ORDER BY completed_at"),
    skillProgress: all("SELECT * FROM SkillProgress"),
    recommendations: all("SELECT * FROM AIRecommendations"),
  });
});
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Endpoint not found." }),
);
app.use((error, req, res, next) => {
  console.error(error.message);
  res
    .status(400)
    .json({
      error: error.message.includes("SQLITE")
        ? "Unable to save this change. Check linked items and try again."
        : error.message,
    });
});
if (existsSync("dist")) {
  app.use(express.static(resolve("dist")));
  app.get("*", (req, res) => res.sendFile(resolve("dist/index.html")));
}
const port = Number(process.env.PORT) || 3001;
app.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`Ascend API ready at http://localhost:${port}`),
);
