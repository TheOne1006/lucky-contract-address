import { useState, useEffect } from "react"

import Editor, { loader } from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { useTheme } from "next-themes"

type MonacoEditorProps = {
  lang?: string
  code?: string
  readonly?: boolean
  minimap?: boolean
  enableValidation?: boolean
  onCodeChange?: (code: string) => void
}

const langMap: {
  [key: string]: string
} = {
  solidity: "sol",
  bytecode: "hex",
}

// 配置 Monaco Editor 使用本地的 vs loader
if (process.env.NEXT_PUBLIC_ENABLE_CDN_RESOURCES !== "true") {
  loader.config({
    paths: {
      vs: "/monaco-editor/min/vs",
    },
  })
}

export const MonacoEditor = ({
  code,
  onCodeChange,
  lang = "solidity",
  readonly = false,
  minimap = false,
  enableValidation = true,
}: MonacoEditorProps) => {
  const [codeEditor, setCodeEditor] =
    useState<editor.IStandaloneCodeEditor | null>(null)
  const { resolvedTheme } = useTheme()
  const [language, setLanguage] = useState(langMap[lang] || lang)

  useEffect(() => {
    setLanguage((lang && langMap[lang]) || lang)
  }, [lang])

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    if (!editor) {
      return
    }

    setCodeEditor(editor)

    editor.updateOptions({
      glyphMargin: false,
      folding: true,
      readOnly: readonly,
      minimap: {
        enabled: minimap,
      },

      hover: {
        enabled: enableValidation,
      },
      suggest: {
        showWords: enableValidation,
      },
      quickSuggestions: enableValidation,
      renderValidationDecorations: enableValidation ? "editable" : "off",
    })
  }

  useEffect(() => {
    if (!codeEditor) {
      return
    }
  }, [codeEditor, readonly])

  return (
    <div className="h-full">
      <Editor
        options={{
          minimap: {
            enabled: minimap,
          },
          readOnly: readonly,
          hover: {
            enabled: enableValidation,
          },
          suggest: {
            showWords: enableValidation,
          },
          quickSuggestions: enableValidation,
          renderValidationDecorations: enableValidation ? "editable" : "off",
        }}
        language={language}
        theme={resolvedTheme == "dark" ? "vs-dark" : "vs-light"}
        onMount={handleEditorDidMount}
        value={code}
        onChange={(newCode) => {
          if (onCodeChange && newCode) {
            onCodeChange(newCode)
          }
        }}
      />
    </div>
  )
}
// export default MonacoEditor
