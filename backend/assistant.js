export const connected = () =>
  !!(process.env.AI_API_KEY && process.env.AI_API_URL);
export async function askModel(messages) {
  const response = await fetch(process.env.AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: process.env.AI_MODEL || "default",
      messages,
    }),
  });
  if (!response.ok)
    throw new Error(
      "AI provider is unavailable. Please try again; your progress has not been changed.",
    );
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim())
    throw new Error("AI provider returned an empty response.");
  return content.slice(0, 20000);
}
export function modelJSON(content) {
  try {
    return JSON.parse(
      content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""),
    );
  } catch {
    return null;
  }
}
export function checkedSuggestion(raw, skills, stats) {
  if (!raw || typeof raw.title !== "string" || !raw.title.trim()) return null;
  const clamp = (v, min, max, defaultValue) =>
    Number.isFinite(Number(v))
      ? Math.round(Math.min(max, Math.max(min, Number(v))))
      : defaultValue;
  return {
    title: raw.title.trim().slice(0, 200),
    minutes: clamp(raw.minutes, 5, 480, 30),
    xp: clamp(raw.xp, 5, 200, 40),
    skillId: skills.some((s) => s.id === raw.skillId) ? raw.skillId : null,
    statIds: Array.isArray(raw.statIds)
      ? [...new Set(raw.statIds.filter((id) => stats.some((s) => s.id === id)))]
      : [],
    difficulty: ["Easy", "Moderate", "Challenging"].includes(raw.difficulty)
      ? raw.difficulty
      : "Moderate",
    type: "AI Suggested",
  };
}
export function starterRoadmap(title) {
  if (/run|бег/i.test(title))
    return [
      "Find a comfortable starting distance",
      "Build a three-day weekly running routine",
      "Increase distance gradually",
      "Complete your target distance",
    ];
  if (/english|korean|language|англий|язык/i.test(title))
    return [
      "Assess your current language level",
      "Build a daily vocabulary habit",
      "Practice real conversations weekly",
      "Review progress with a practice test",
    ];
  if (/develop|code|program|программ|разработ/i.test(title))
    return [
      "Learn the language fundamentals",
      "Build your first small project",
      "Practice APIs and data storage",
      "Publish a portfolio project",
    ];
  if (/piano|music|пианино/i.test(title))
    return [
      "Learn posture and basic notation",
      "Practice scales and simple chords",
      "Learn your first complete song",
      "Record a performance and reflect",
    ];
  return [
    "Define a clear, achievable outcome",
    "Choose your first resource or mentor",
    "Build a weekly practice habit",
    "Complete a practical milestone",
    "Reflect and choose the next step",
  ];
}
