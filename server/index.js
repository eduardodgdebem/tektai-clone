import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const responseSchema = {
  name: "CommandResponse",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      reply: { type: "string" },
      actions: {
        type: "array",
        items: {
          oneOf: [
            {
              type: "object",
              additionalProperties: false,
              properties: {
                type: { const: "scale" },
                factor: { type: "number", exclusiveMinimum: 0 },
              },
              required: ["type", "factor"],
            },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                type: { const: "rotate" },
                axis: { type: "string", enum: ["x", "y", "z"] },
                degrees: { type: "number" },
              },
              required: ["type", "axis", "degrees"],
            },
            {
              type: "object",
              additionalProperties: false,
              properties: {
                type: { const: "move" },
                axis: { type: "string", enum: ["x", "y", "z"] },
                // Explicitly allow negatives.
                distance: { type: "number", minimum: -1e9, maximum: 1e9 },
              },
              required: ["type", "axis", "distance"],
            },
          ],
        },
        default: [],
      },
    },
    required: ["reply", "actions"],
  },
};

const systemPrompt = `You translate user chat about manipulating a 3D cube into structured actions.
- The cube supports: scaling, rotating around X/Y/Z, and moving along the X, Y, or Z axes.
- For translation use meters: +X moves right, -X moves left, +Y moves up, -Y moves down, +Z moves forward, -Z moves back.
- Convert percentages to scale factors (e.g. +20% => 1.2).
- Convert phrases like "twice as big" to a single factor.
- Rotations use degrees, following the right-hand rule.
- If the request is ambiguous or unsupported, respond with no actions and explain why.
Return a friendly reply plus the actions array.`;

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const normaliseActions = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((action) => {
    if (!action || typeof action !== "object") return [];
    if (action.type === "scale") {
      const factor = Number(action.factor);
      if (!Number.isFinite(factor) || factor <= 0) return [];
      return [{ type: "scale", factor }];
    }
    if (action.type === "rotate") {
      const degrees = Number(action.degrees);
      if (!Number.isFinite(degrees)) return [];
      if (!["x", "y", "z"].includes(action.axis)) return [];
      return [{ type: "rotate", axis: action.axis, degrees }];
    }
    if (action.type === "move") {
      const distance = Number(action.distance);
      if (!Number.isFinite(distance)) return [];
      if (!["x", "y", "z"].includes(action.axis)) return [];
      return [{ type: "move", axis: action.axis, distance }];
    }
    return [];
  });
};

app.post("/api/actions", async (req, res) => {
  const message = (req.body && req.body.message) || "";
  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ reply: "Please provide a message to interpret.", actions: [] });
  }

  if (!openaiClient) {
    return res
      .status(500)
      .json({
        reply: "OpenAI API key is not configured on the server.",
        actions: [],
      });
  }

  try {
    const response = await openaiClient.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        { role: "user", content: [{ type: "input_text", text: message }] },
      ],
      text: {
        format: {
          type: "json_schema",
          name: responseSchema.name, // <-- required at this level.
          schema: responseSchema.schema, // <-- your schema object.
          strict: false,
        },
      },
      max_output_tokens: 600,
    });

    let parsed = null;
    if (response.output_parsed) parsed = response.output_parsed;
    if (!parsed) {
      try {
        const text = response.output_text || "";
        parsed = text ? JSON.parse(text) : null;
      } catch (_) {
        parsed = null;
      }
    }
    if (!parsed) parsed = { reply: "Here is what I found.", actions: [] };

    const actions = normaliseActions(parsed.actions);
    res.json({ reply: parsed.reply || "Here is what I found.", actions });
  } catch (error) {
    const details =
      (error && error.error && error.error.message) ||
      (error && error.message) ||
      (error && typeof error === "object"
        ? JSON.stringify(error)
        : String(error) || "Unknown error");

    console.error("OpenAI request failed:", {
      status: error && error.status,
      code: error && error.code,
      type: error && error.type,
      details,
    });

    res
      .status(500)
      .json({
        reply: "Command service failed. Please try again.",
        actions: [],
      });
  }
});

app.listen(PORT, () => {
  console.log(`Command service listening on port ${PORT}`);
});
