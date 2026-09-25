import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("personal growth workflow persists atomic, auditable progress", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "ascend-test-"));
  const port = 33000 + Math.floor(Math.random() * 10000);
  const server = spawn(process.execPath, ["backend/server.js"], {
    env: {
      ...process.env,
      PORT: String(port),
      AI_API_KEY: "",
      ACCOUNTS_PATH: join(dir, "accounts"),
      DATABASE_PATH: join(dir, "test.db"),
    },
  });
  let logs = "";
  server.stdout.on("data", (d) => (logs += d));
  server.stderr.on("data", (d) => (logs += d));
  t.after(async () => {
    const exited = new Promise((r) => server.once("exit", r));
    server.kill();
    await exited;
    rmSync(dir, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(logs || "Server did not start")),
      10000,
    );
    server.stdout.on("data", (d) => {
      if (d.toString().includes("ready")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.on("error", reject);
  });
  const req = async (path, method = "GET", body, cookie) => {
    const r = await fetch(`http://localhost:${port}/api${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return {
      status: r.status,
      body: await r.json(),
      cookie: r.headers.get("set-cookie")?.split(";")[0],
    };
  };
  const initial = (await req("/state")).body;
  assert.equal(initial.stats.length, 9);
  const quest = {
    title: "Integration practice",
    skillId: "programming",
    statIds: ["intellect", "career"],
    xp: 60,
    minutes: 30,
  };
  const created = await req("/quests", "POST", quest);
  assert.equal(created.status, 200);
  const result = await req(`/quests/${created.body.id}/complete`, "POST");
  assert.equal(result.status, 200);
  assert.equal(result.body.state.profile.totalXp, initial.profile.totalXp + 60);
  assert.equal(result.body.rewards.length, 4);
  assert.equal(
    result.body.state.skills.find((s) => s.id === "programming").totalXp,
    initial.skills.find((s) => s.id === "programming").totalXp + 60,
  );
  const duplicate = await req(`/quests/${created.body.id}/complete`, "POST");
  assert.equal(duplicate.status, 400);
  const repeated = await req("/log/confirm", "POST", quest);
  assert.equal(repeated.body.xp, 40);
  const saved = (await req("/state")).body;
  assert.equal(saved.profile.totalXp, initial.profile.totalXp + 100);
  const tx = saved.transactions.filter((t) => t.reason === quest.title);
  assert.equal(
    tx
      .filter((t) => t.entity_type === "overall")
      .reduce((a, t) => a + t.amount, 0),
    100,
  );
  const invalid = await req("/log/confirm", "POST", { ...quest, xp: -1 });
  assert.equal(invalid.status, 400);
  assert.equal((await req("/state")).body.quests.length, saved.quests.length);
  const chat = await req("/chat", "POST", {
    message: "I have 40 minutes. Give me a quest.",
  });
  assert.equal(chat.status, 200);
  assert.equal(chat.body.state.conversations.at(-1).action.minutes, 40);
  await req("/stats/career", "DELETE");
  assert.ok(
    !(await req("/state")).body.skills
      .find((s) => s.id === "programming")
      .statIds.includes("career"),
  );
  const goal = await req("/goals", "POST", {
    title: "Build an app",
    milestones: ["Learn", "Build"],
  });
  const id = goal.body.goals.at(-1).id;
  const ms = goal.body.goals.at(-1).milestones[0];
  await req(`/milestones/${ms.id}`, "PATCH", { completed: true });
  assert.equal(
    (await req("/state")).body.goals.find((g) => g.id === id).milestones[0]
      .completed,
    1,
  );
  const onboarding = await req("/onboarding", "POST", {
    name: "Test learner",
    goal: "Learn Python",
    skills: "Python, English",
    experience: 5,
    daily_minutes: 45,
    activity: 3,
  });
  assert.equal(onboarding.status, 200);
  assert.equal(onboarding.body.profile.name, "Test learner");
  assert.equal(onboarding.body.profile.onboarded, 1);
  assert.equal(onboarding.body.completions.length, 0);
  assert.equal(onboarding.body.skills.length, 2);
  assert.equal(onboarding.body.skills[0].level, 5);
  const exported = await req("/export");
  assert.equal(exported.body.profile.name, "Test learner");
  assert.ok(exported.body.transactions.length > 0);
  const a = await req("/auth/register", "POST", {
    name: "Learner A",
    email: "a@example.test",
    password: "safe-password-a",
  });
  assert.equal(a.status, 200);
  assert.ok(a.cookie);
  assert.equal(a.body.state.account.email, "a@example.test");
  const b = await req("/auth/register", "POST", {
    name: "Learner B",
    email: "b@example.test",
    password: "safe-password-b",
  });
  assert.equal(b.status, 200);
  const beforeA = (await req("/state", "GET", undefined, a.cookie)).body;
  const logged = await req(
    "/log/confirm",
    "POST",
    {
      title: "Only learner A did this",
      xp: 70,
      minutes: 40,
      skillId: "programming",
      statIds: ["intellect"],
    },
    a.cookie,
  );
  assert.equal(logged.status, 200);
  assert.equal(logged.body.state.profile.totalXp, beforeA.profile.totalXp + 70);
  const stateB = (await req("/state", "GET", undefined, b.cookie)).body;
  assert.equal(stateB.profile.name, "Learner B");
  assert.equal(stateB.profile.totalXp, beforeA.profile.totalXp);
  assert.ok(!stateB.quests.some((q) => q.title === "Only learner A did this"));
  assert.equal((await req("/state")).body.profile.name, "Test learner");
  const badLogin = await req("/auth/login", "POST", {
    email: "a@example.test",
    password: "wrong-password",
  });
  assert.equal(badLogin.status, 401);
  const login = await req("/auth/login", "POST", {
    email: "a@example.test",
    password: "safe-password-a",
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.state.profile.totalXp, beforeA.profile.totalXp + 70);
  const changed = await req(
    "/auth/password",
    "POST",
    { currentPassword: "safe-password-a", password: "new-safe-password" },
    login.cookie,
  );
  assert.equal(changed.status, 200);
  assert.equal((await req("/state", "GET", undefined, a.cookie)).status, 401);
  assert.equal(
    (
      await req("/auth/login", "POST", {
        email: "a@example.test",
        password: "safe-password-a",
      })
    ).status,
    401,
  );
  const newLogin = await req("/auth/login", "POST", {
    email: "a@example.test",
    password: "new-safe-password",
  });
  assert.equal(newLogin.status, 200);
  await req("/auth/logout", "POST", {}, newLogin.cookie);
  assert.equal(
    (await req("/state", "GET", undefined, newLogin.cookie)).status,
    401,
  );
});
