const { GoogleGenerativeAI } = require("@google/generative-ai");

function normalizeLanguage(language) {
  return String(language || "")
    .trim()
    .toLowerCase();
}

function removeMarkdownFences(text) {
  if (!text) {
    return "";
  }

  return String(text)
    .replace(/^```[a-zA-Z0-9]*\n?/m, "")
    .replace(/```$/m, "")
    .trim();
}

async function generateCode({ prompt, language }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const normalizedLanguage = normalizeLanguage(language);
  const genAI = new GoogleGenerativeAI(apiKey);
  const instruction = [
    `You are a senior ${normalizedLanguage} developer.`,
    "Generate a clean starter solution for the user request.",
    "Return only runnable source code without markdown fences.",
    `Request: ${prompt}`,
  ].join("\n");

  const preferredModel = process.env.GEMINI_MODEL || "models/gemini-2.0-flash";
  const fallbackModels = [
    preferredModel,
    "models/gemini-2.0-flash",
    "models/gemini-2.5-flash",
    "models/gemini-flash-latest",
    "models/gemini-pro-latest",
  ];

  let lastError = null;
  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(instruction);
      const text = result?.response?.text?.() || "";
      return removeMarkdownFences(text);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to generate code from Gemini");
}

module.exports = {
  generateCode,
};
