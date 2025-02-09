import { useState, useCallback } from "react"

import { IConsoleOutput } from "../types"
export function useConsole() {
  // log
  const [output, setOutput] = useState<IConsoleOutput[]>([
    // {
    //   type: "info",
    //   message: `Loading Solidity compiler ${solcVersion}...`,
    // },
  ])

  const log = useCallback(
    (line: string, type: IConsoleOutput["type"] = "info") => {
      // See https://blog.logrocket.com/a-guide-to-usestate-in-react-ecb9952e406c/
      setOutput((previous) => {
        const cloned = previous.map((x) => ({ ...x }))
        cloned.push({ type, message: line })
        return cloned
      })
    },
    [setOutput],
  )

  return {
    output,
    log,
  }
}
