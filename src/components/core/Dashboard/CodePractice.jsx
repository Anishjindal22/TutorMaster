import { useDispatch, useSelector } from "react-redux"
import {
  setAiPrompt,
  setCode,
  setLanguage,
  setStdin,
} from "../../../slices/codeExecutorSlice"
import { generateCode, runCode } from "../../../services/operations/codeExecutionAPI"

function CodePractice() {
  const dispatch = useDispatch()
  const {
    language,
    code,
    stdin,
    output,
    aiPrompt,
    isExecuting,
    isGenerating,
    error,
  } = useSelector((state) => state.codeExecutor)

  const handleRun = () => {
    dispatch(runCode(language, code, stdin))
  }

  const handleGenerate = () => {
    if (!aiPrompt.trim()) {
      return
    }
    dispatch(generateCode(language, aiPrompt))
  }

  const lineNumbers = code.split("\n")

  return (
    <div className="space-y-6 text-text-main">
      <div>
        <h1 className="text-3xl font-semibold">Code Practice</h1>
        <p className="mt-2 text-sm text-text-muted">
          Run Java, C++, and Python code. Generate starter code with Gemini.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="md:col-span-1">
          <p className="mb-2 text-sm font-medium">Language</p>
          <select
            value={language}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            className="w-full rounded-lg border border-surface-border bg-surface-dim px-3 py-2 outline-none"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <p className="mb-2 text-sm font-medium">Code</p>
            <div className="overflow-hidden rounded-xl border border-[#3c3c3c] bg-[#1e1e1e]">
              <div className="flex items-center justify-between border-b border-[#2d2d2d] bg-[#252526] px-3 py-2 text-xs text-[#c5c5c5]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="rounded-sm bg-[#1f1f1f] px-2 py-1 font-mono text-[#9cdcfe]">
                  main.{language === "cpp" ? "cpp" : language === "java" ? "java" : "py"}
                </div>
              </div>

              <div className="grid max-h-[460px] grid-cols-[52px_1fr] overflow-auto">
                <div className="select-none border-r border-[#2d2d2d] bg-[#252526] py-3 text-right font-mono text-xs leading-6 text-[#858585]">
                  {lineNumbers.map((_, index) => (
                    <div key={`line-${index + 1}`} className="pr-3">
                      {index + 1}
                    </div>
                  ))}
                </div>

                <textarea
                  value={code}
                  onChange={(e) => dispatch(setCode(e.target.value))}
                  rows={16}
                  spellCheck={false}
                  className="w-full resize-y bg-[#1e1e1e] p-3 font-mono text-sm leading-6 text-[#d4d4d4] outline-none"
                  placeholder="Write your code here"
                />
              </div>
            </div>
          </label>

          <label>
            <p className="mb-2 text-sm font-medium">Standard Input</p>
            <textarea
              value={stdin}
              onChange={(e) => dispatch(setStdin(e.target.value))}
              rows={4}
              className="w-full rounded-lg border border-surface-border bg-black/20 p-3 font-mono text-sm outline-none"
              placeholder="Provide input for your program"
            />
          </label>

          <button
            type="button"
            onClick={handleRun}
            disabled={isExecuting || !code.trim()}
            className="rounded-lg bg-brand-primary px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExecuting ? "Running..." : "Run Code"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-surface-border bg-surface-dim/40 p-4">
            <p className="mb-2 text-sm font-medium">Gemini Prompt</p>
            <textarea
              value={aiPrompt}
              onChange={(e) => dispatch(setAiPrompt(e.target.value))}
              rows={6}
              className="w-full rounded-lg border border-surface-border bg-black/20 p-3 text-sm outline-none"
              placeholder="Example: Write a function to find the longest palindromic substring"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="mt-3 rounded-lg bg-brand-secondary px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate Starter Code"}
            </button>
          </div>

          <div className="rounded-lg border border-surface-border bg-black/30 p-4">
            <p className="mb-2 text-sm font-medium">Output</p>
            <pre className="min-h-[220px] whitespace-pre-wrap break-words font-mono text-sm text-text-main">
              {output || "Output will appear here."}
            </pre>
          </div>

          {error ? <p className="text-sm text-pink-200">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default CodePractice
