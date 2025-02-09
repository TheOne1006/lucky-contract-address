import { useTranslation } from "next-i18next"
import { Icon } from "@/components/ui"
import clsx from "clsx"
import { useState } from "react"

type LogTableProps = {
  logs: {
    address: string
    salt: string
    time: number
  }[]

  onOpenDeployModal: (_salt: bigint, _address: `0x${string}`) => void
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

const LogTable = ({ logs, onOpenDeployModal }: LogTableProps) => {
  const { t } = useTranslation("common")
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {},
  )

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
        {logs.reverse().map((log) => (
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
                <div className="break-all text-white">{log.address}</div>
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
                  {log.address}
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
