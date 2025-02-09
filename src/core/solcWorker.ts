import { compile } from "./compileSolidity"

self.onmessage = async (e: MessageEvent) => {
  try {
    const { sourceCode } = e.data

    const result = compile(sourceCode)

    self.postMessage(result)
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}

export {}
