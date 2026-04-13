const { executeCode, SUPPORTED_LANGUAGES } = require("../utils/codeRunner");
const { generateCode } = require("../utils/geminiClient");

function normalizeLanguage(language) {
  return String(language || "")
    .trim()
    .toLowerCase();
}

function isSupportedLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(normalizeLanguage(language));
}

exports.executeUserCode = async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: "language and code are required",
      });
    }

    if (!isSupportedLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language. Allowed: ${SUPPORTED_LANGUAGES.join(", ")}`,
      });
    }

    const result = await executeCode({
      language,
      code,
      stdin,
    });

    return res.status(200).json({
      success: true,
      message: "Code executed successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Code execution failed",
    });
  }
};

exports.generateStarterCode = async (req, res) => {
  try {
    const { language, prompt } = req.body;

    if (!language || !prompt) {
      return res.status(400).json({
        success: false,
        message: "language and prompt are required",
      });
    }

    if (!isSupportedLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language. Allowed: ${SUPPORTED_LANGUAGES.join(", ")}`,
      });
    }

    const code = await generateCode({ language, prompt });

    return res.status(200).json({
      success: true,
      message: "Starter code generated successfully",
      code,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Code generation failed",
    });
  }
};
