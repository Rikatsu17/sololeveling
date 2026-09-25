import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  askModel,
  modelJSON,
  checkedSuggestion,
  starterRoadmap,
} from "./assistant.js";

test("model suggestions cannot invent links or bypass XP limits", () => {
  const result = checkedSuggestion(
    {
      title: "A useful action",
      xp: 90000,
      minutes: -20,
      skillId: "unknown",
      statIds: ["intellect", "unknown", "intellect"],
      difficulty: "Impossible",
    },
    [{ id: "programming" }],
    [{ id: "intellect" }],
  );
  assert.equal(result.xp, 200);
  assert.equal(result.minutes, 5);
  assert.equal(result.skillId, null);
  assert.deepEqual(result.statIds, ["intellect"]);
  assert.equal(result.difficulty, "Moderate");
  assert.equal(checkedSuggestion({ title: "" }, [], []), null);
});
test("structured model replies and local roadmaps parse predictably", () => {
  assert.deepEqual(modelJSON('```json\n{"message":"Hello"}\n```'), {
    message: "Hello",
  });
  assert.equal(modelJSON("A plain answer"), null);
  assert.match(starterRoadmap("Learn piano")[0], /posture/);
});
test("provider adapter sends context and handles unsuccessful responses", async (t) => {
  let incoming;
  let failure = false;
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    incoming = { body: JSON.parse(body), auth: req.headers.authorization };
    res.setHeader("Content-Type", "application/json");
    if (failure) {
      res.statusCode = 503;
      res.end("{}");
    } else
      res.end(
        JSON.stringify({
          choices: [
            {
              message: {
                content: '{"message":"A thoughtful answer","quest":null}',
              },
            },
          ],
        }),
      );
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const original = {
    url: process.env.AI_API_URL,
    key: process.env.AI_API_KEY,
    model: process.env.AI_MODEL,
  };
  process.env.AI_API_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.AI_API_KEY = "test-only";
  process.env.AI_MODEL = "test-model";
  t.after(async () => {
    for (const [key, value] of Object.entries({
      AI_API_URL: original.url,
      AI_API_KEY: original.key,
      AI_MODEL: original.model,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await new Promise((r) => server.close(r));
  });
  const reply = await askModel([{ role: "user", content: "Help me plan" }]);
  assert.equal(modelJSON(reply).message, "A thoughtful answer");
  assert.equal(incoming.body.model, "test-model");
  assert.equal(incoming.auth, "Bearer test-only");
  failure = true;
  await assert.rejects(
    () => askModel([{ role: "user", content: "Help" }]),
    /unavailable/,
  );
});
