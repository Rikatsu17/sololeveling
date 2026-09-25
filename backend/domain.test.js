import test from "node:test";
import assert from "node:assert/strict";
import { levelInfo, rewardFor, suggestAction, getStreak } from "./domain.js";
test("level rollover preserves excess XP", () =>
  assert.deepEqual(levelInfo(1050), {
    level: 3,
    xp: 50,
    needed: 500,
    percent: 10,
  }));
test("repeated actions yield diminishing rewards", () => {
  assert.equal(rewardFor({ xp: 60 }, 0), 60);
  assert.equal(rewardFor({ xp: 60 }, 1), 40);
  assert.equal(rewardFor({ xp: 60 }, 2), 30);
  assert.equal(rewardFor({ xp: 900 }, 0), 200);
});
test("log estimation extracts duration and only existing links", () => {
  const r = suggestAction(
    "Studied programming for 2 hours",
    [{ id: "code", name: "Programming" }],
    [{ id: "intellect" }],
  );
  assert.equal(r.minutes, 120);
  assert.equal(r.skillId, "code");
  assert.deepEqual(r.statIds, ["intellect"]);
  assert.equal(r.xp, 150);
});
test("streak includes yesterday before today is completed", () => {
  assert.equal(
    getStreak(["2026-09-22", "2026-09-23", "2026-09-24"], "2026-09-25"),
    3,
  );
  assert.equal(getStreak(["2026-09-21"], "2026-09-25"), 0);
});
