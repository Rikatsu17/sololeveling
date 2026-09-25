export const today = () => new Date().toISOString().slice(0, 10);
export const levelInfo = (xp, step = 500) => ({
  level: Math.floor(xp / step) + 1,
  xp: xp % step,
  needed: step,
  percent: Math.round(((xp % step) / step) * 100),
});
export function rewardFor(quest, repetitions = 0) {
  const base = Math.max(5, Math.min(200, Number(quest.xp) || 20));
  return Math.max(1, Math.round(base / (1 + repetitions * 0.5)));
}
export function suggestAction(text, skills, stats, minutes = 30) {
  const rules = [
    [
      /code|program|flutter|python|algorithm|leet|программ|алгорит|код/i,
      "Programming",
      ["intellect", "career", "focus"],
    ],
    [
      /english|language|korean|spanish|англий|язык|слов/i,
      "English",
      ["communication", "intellect"],
    ],
    [
      /piano|music|design|write|draw|пианино|музык|дизайн/i,
      "Piano",
      ["creativity", "focus"],
    ],
    [
      /run|workout|gym|fitness|train|бег|тренир|спорт/i,
      "Running",
      ["body", "discipline"],
    ],
    [
      /read|book|learn|study|чита|книг|изуч/i,
      "Reading",
      ["intellect", "focus"],
    ],
    [/business|finance|money|бизнес|финанс/i, "Finance", ["capital", "career"]],
  ];
  const rule = rules.find(([pattern]) => pattern.test(text));
  const skill =
    skills.find(
      (s) => s.name.toLowerCase() === (rule?.[1] || "").toLowerCase(),
    ) || skills.find((s) => text.toLowerCase().includes(s.name.toLowerCase()));
  const statIds = (rule?.[2] || ["discipline", "focus"]).filter((id) =>
    stats.some((s) => s.id === id),
  );
  const hour = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|час)/i);
  const mins = text.match(/(\d+)\s*(?:min|мин)/i);
  const duration = Math.min(
    480,
    Math.max(
      5,
      hour
        ? Number(hour[1]) * 60
        : mins
          ? Number(mins[1])
          : Number(minutes) || 30,
    ),
  );
  return {
    title: text.trim().slice(0, 200),
    minutes: duration,
    xp: Math.min(200, Math.round(duration * 1.25)),
    skillId: skill?.id || null,
    statIds,
    difficulty: duration >= 60 ? "Challenging" : "Moderate",
  };
}
export function getStreak(dates, now = today()) {
  const set = new Set(dates);
  const d = new Date(`${now}T12:00:00Z`);
  if (!set.has(now)) d.setUTCDate(d.getUTCDate() - 1);
  let count = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    count++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return count;
}
