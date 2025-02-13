import { useTranslation } from "next-i18next"
import { Icon } from "@/components/ui"
import clsx from "clsx"
import { useState, useEffect } from "react"

type LogTableProps = {
  logs: {
    address: string
    salt: string
    time: number
  }[]
  matchers?: string[]
  onOpenDeployModal: (_salt: bigint, _address: `0x${string}`) => void
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

// 在渲染部分，将地址文本分成三部分：前缀、高亮部分和后缀
const renderHighlightedAddress = (
  address: string,
  highlight: { text: string; index: number },
) => {
  if (!highlight.text || highlight.index === -1) return address

  const prefix = address.slice(0, highlight.index)
  const highlightedText = address.slice(
    highlight.index,
    highlight.index + highlight.text.length,
  )
  const suffix = address.slice(highlight.index + highlight.text.length)

  return (
    <>
      {prefix}
      <span className="text-red-500">{highlightedText}</span>
      {suffix}
    </>
  )
}

const LogTable = ({ logs, matchers, onOpenDeployModal }: LogTableProps) => {
  const { t } = useTranslation("common")

  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {},
  )
  const [logsWithHightLight, setLogsWithHightLight] = useState<
    {
      address: string
      salt: string
      time: number
      highlight: {
        text: string
        index: number
      }
    }[]
  >([])

  useEffect(() => {
    if (!matchers?.length) {
      setLogsWithHightLight(
        logs.map((log) => ({ ...log, highlight: { text: "", index: -1 } })),
      )
      return
    }
    // 初始化 matchers => (regex|string)[]
    const regexStringArray = matchers
      ?.filter((matcher): matcher is string => matcher !== undefined)
      .map((matcher) => {
        console.log("matcher,", matcher)
        // 如果包含 //
        if (matcher.startsWith("/")) {
          try {
            const regex = new RegExp(matcher.slice(1, -1), "i")
            return regex
          } catch (e) {
            return undefined
          }
        }
        return matcher
      })
      .filter((item) => item)

    // 遍历 logs, 找到匹配的, 并高亮
    const newLogs = logs.map((log) => {
      let highlight = { text: "", index: -1 }
      for (const regex of regexStringArray) {
        if (regex instanceof RegExp) {
          const match = log.address.match(regex)
          console.log("match,", match)
          if (match) {
            highlight = { text: match[0], index: match.index || -1 }
            break
          }
        } else {
          const index = log.address.indexOf(regex as string)
          if (index !== -1) {
            highlight = { text: regex as string, index }
            break
          }
        }
      }
      return { ...log, highlight }
    })
    setLogsWithHightLight(newLogs)
  }, [matchers?.length, matchers?.join("-"), logs.length])

  const toggleRow = (address: string, expanded: boolean) => {
    setExpandedRows((prev) => {
      const newState: { [key: string]: boolean } = {
        ...prev,
      }
      // if (!prev[address]) {
      //   newState[address] = expanded
      // }
      newState[address] = expanded
      return newState
    })
  }

  return (
    <div className="relative shadow-md sm:rounded-lg">
      {logs.length ? (
        <div className="sticky top-0 z-10 grid grid-cols-9 gap-1 bg-black-700 p-2 text-xs font-medium text-gray-300">
          <div className="col-span-8">{t("label.Address")}</div>
          <div>{t("label.action")}</div>
        </div>
      ) : (
        ""
      )}

      <div>
        {logs.map((log) => (
          <div
            key={`${log.address}`}
            className={clsx(
              "cursor-pointer border-b border-gray-700 p-2 text-xs odd:bg-black-600",
            )}
          >
            {expandedRows[log.address] ? (
              <div className="grid grid-cols-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-white">Address：</div>
                  <button
                    onClick={(e) => {
                      toggleRow(log.address, false)
                    }}
                    className="inline-flex items-center text-gray-300 hover:text-white"
                  >
                    <Icon name="arrow-drop-down-line" />
                    <span> {t("action.Collapse")}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(log.salt)
                    }}
                    className="inline-flex items-center text-gray-300 hover:text-white"
                  >
                    <Icon name="file-copy-line" />
                    <span> {t("action.Copy")}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenDeployModal(
                        BigInt(log.salt),
                        log.address as `0x${string}`,
                      )
                    }}
                    className="inline-flex items-center text-gray-300 hover:text-white"
                  >
                    <Icon name="eth-line" />
                    <span>{t("action.Deploy")}</span>
                  </button>
                </div>
                <div className="break-all text-white">
                  {renderHighlightedAddress(
                    log.address,
                    logsWithHightLight.find((l) => l.address === log.address)
                      ?.highlight || { text: "", index: -1 },
                  )}
                </div>
                <div className="font-medium text-white">Salt：</div>
                <div className="break-all text-gray-300">{log.salt}</div>
                <div className="font-medium text-white">
                  {t("label.FindAt")}：
                </div>
                <div className="text-gray-300">{formatTimestamp(log.time)}</div>
              </div>
            ) : (
              <div
                className="grid grid-cols-9 gap-1"
                onClick={() => toggleRow(log.address, true)}
              >
                <div
                  className="col-span-8 truncate font-medium text-white"
                  title={log.address}
                >
                  {renderHighlightedAddress(
                    log.address,
                    logsWithHightLight.find((l) => l.address === log.address)
                      ?.highlight || { text: "", index: -1 },
                  )}
                </div>
                {/* <div
                className="col-span-3 truncate text-gray-300"
                title={log.salt}
              >
                {log.salt}
              </div> */}
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(log.address)
                    }}
                    className="inline-flex items-center text-gray-300 hover:text-white"
                  >
                    <Icon name="file-copy-line" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogTable
