import { useState, useEffect } from "react"
import { formatEther, getAddress } from "viem"
import { getTransactionReceipt, getTransaction } from "@wagmi/core"
import {
  useTransaction,
  useTransactionReceipt,
  useChainId,
  useAccount,
  useConfig,
} from "wagmi"
import { ALLOW_CHAINS_WITH_BUILD_CONTRACT } from "@/util/constants"
import { getLogs } from "@/core/deployedContractsLog"
import type { DeployedLogItem } from "@/types/deployed.log"
import { Icon } from "@/components/ui"

// cacheKey = 'Transaction+hash' or 'Receipt+hash'
const cacheMap = new Map<
  string,
  {
    receipt: Awaited<ReturnType<typeof getTransactionReceipt>>
    transaction: Awaited<ReturnType<typeof getTransaction>>
  }
>()

function TransactionDetails({ txHash }: { txHash: string }) {
  const [details, setDetails] = useState<{
    receipt: Awaited<ReturnType<typeof getTransactionReceipt>>
    transaction: Awaited<ReturnType<typeof getTransaction>>
  } | null>(null)
  const config = useConfig()

  useEffect(() => {
    if (!txHash) return
    const fetchDetails = async () => {
      const cacheKey = `cache-${txHash}`
      if (cacheMap.has(cacheKey)) {
        const item = cacheMap.get(cacheKey)
        if (item) {
          setDetails(item)
        }
        return
      }

      try {
        const [receipt, transaction] = await Promise.all([
          getTransactionReceipt(config, { hash: txHash as `0x${string}` }),
          getTransaction(config, { hash: txHash as `0x${string}` }),
        ])

        if (receipt && transaction) {
          setDetails({ receipt, transaction })
          cacheMap.set(cacheKey, {
            receipt,
            transaction,
          })
        }
      } catch (error) {
        console.error("Failed to fetch transaction details:", error)
      }
    }

    fetchDetails()
  }, [txHash, config])

  if (!details?.receipt || !details?.transaction) {
    return null
  }

  const { receipt, transaction } = details

  return (
    <div className="mt-4 space-y-2 text-xs text-gray-500">
      <p>Block Number: {receipt.blockNumber.toString()}</p>
      <p>Gas Used: {receipt.gasUsed.toString()}</p>
      <p>Status: {receipt.status}</p>
      <p>cumulativeGasUsed: {receipt.cumulativeGasUsed.toString()}</p>
      <p>effectiveGasPrice: {receipt.effectiveGasPrice.toString()}</p>
      <p>
        ETH Used: {formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} ETH
      </p>
      <p>Value: {formatEther(transaction.value)} ETH </p>
      <p>Block Hash: {receipt.blockHash}</p>
    </div>
  )
}

function DeployedLogs() {
  const [expandedRows, setExpandedRows] = useState<{
    [key: string]: boolean
  }>({})

  const chainId = useChainId()
  const account = useAccount()

  const [logs, setLogs] = useState<DeployedLogItem[]>([])

  useEffect(() => {
    if (!chainId || !account.address) return

    let factoryAddress: `0x${string}` = "0x"
    ALLOW_CHAINS_WITH_BUILD_CONTRACT.find((item) => {
      if (item.id === chainId) {
        factoryAddress = item.factoryAddress as `0x${string}`
      }
    })

    const _logs = getLogs(
      getAddress(account?.address as "string"),
      getAddress(factoryAddress),
      chainId,
    )
    setLogs(_logs)
  }, [chainId, account.address])

  const toggleRowExpansion = (txHash: string) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [txHash]: !prevExpandedRows[txHash],
    }))
  }

  return (
    <ul role="list" className="divide-y divide-gray-100">
      {logs.map((item) => (
        <li key={item.txHash} className="flex flex-col gap-y-2 py-5">
          <div className="flex justify-between gap-x-6">
            <div className="flex min-w-0 gap-x-4">
              <div className="min-w-0 flex-auto">
                <p className="break-all text-sm/6 font-semibold text-gray-900">
                  lucky address: {item.address}
                </p>
                <p className="mt-1 truncate text-xs/5 text-gray-500">
                  txhash: {item.txHash}
                </p>
              </div>
            </div>
            <div className="shrink-0 sm:flex sm:flex-col sm:items-end">
              <p className="break-all text-sm/6 text-gray-900">{item.sender}</p>
              <div className="mt-1 flex items-center gap-x-1.5">
                <p className="text-xs/5 text-gray-500">
                  Chain ID: {item.chainId}
                </p>
              </div>
              <p className="mt-1 break-all text-xs/5 text-gray-500">
                Factory: {item.factoryAddress}
              </p>
              <p className="mt-1 text-xs/5 text-gray-500">
                Salt: {item.salt.toString()}
              </p>
              <button
                onClick={() => toggleRowExpansion(item.txHash)}
                className="mt-2 inline-flex items-center text-xs text-indigo-600 hover:text-indigo-500"
              >
                <Icon
                  name={
                    expandedRows[item.txHash]
                      ? "arrow-drop-left-line"
                      : "arrow-drop-down-line"
                  }
                  className="mr-1 h-4 w-4"
                />
                {expandedRows[item.txHash] ? "Hide" : "Show"} Transaction
                Details
              </button>
            </div>
          </div>
          {expandedRows[item.txHash] && (
            <TransactionDetails txHash={item.txHash} />
          )}
        </li>
      ))}
    </ul>
  )
}

export default DeployedLogs
