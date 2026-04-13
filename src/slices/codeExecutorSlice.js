import { createSlice } from "@reduxjs/toolkit"

const starterCodeByLanguage = {
  python: "print('Hello, World!')",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << \"Hello, World!\" << endl;\n  return 0;\n}",
  java: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}",
}

const initialState = {
  language: "python",
  code: starterCodeByLanguage.python,
  stdin: "",
  output: "",
  aiPrompt: "",
  isExecuting: false,
  isGenerating: false,
  error: null,
}

const codeExecutorSlice = createSlice({
  name: "codeExecutor",
  initialState,
  reducers: {
    setLanguage(state, action) {
      const nextLanguage = action.payload
      state.language = nextLanguage
      state.code = starterCodeByLanguage[nextLanguage] || ""
      state.output = ""
      state.error = null
    },
    setCode(state, action) {
      state.code = action.payload
    },
    setStdin(state, action) {
      state.stdin = action.payload
    },
    setAiPrompt(state, action) {
      state.aiPrompt = action.payload
    },
    setOutput(state, action) {
      state.output = action.payload
    },
    setExecutionLoading(state, action) {
      state.isExecuting = action.payload
    },
    setGenerateLoading(state, action) {
      state.isGenerating = action.payload
    },
    setCodeError(state, action) {
      state.error = action.payload
    },
    resetCodeState(state) {
      state.code = starterCodeByLanguage[state.language] || ""
      state.stdin = ""
      state.output = ""
      state.aiPrompt = ""
      state.error = null
      state.isExecuting = false
      state.isGenerating = false
    },
  },
})

export const {
  setLanguage,
  setCode,
  setStdin,
  setAiPrompt,
  setOutput,
  setExecutionLoading,
  setGenerateLoading,
  setCodeError,
  resetCodeState,
} = codeExecutorSlice.actions

export default codeExecutorSlice.reducer
