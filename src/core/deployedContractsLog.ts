import { loadStorageData, unShit2ArrayStorageData } from "@/util/storage"
import { DeployedLogItem } from "@/types/deployed.log"

const PREFIX_DEPLOYED_LOG_CACHE_KEY = "LUCKY_DEPLOYED_LIST"

function getAllLogs(): DeployedLogItem[] {
  const logs = loadStorageData(PREFIX_DEPLOYED_LOG_CACHE_KEY, [])
  return logs
}

export function getLogs(
  sender: DeployedLogItem["sender"],
  factoryAddress: DeployedLogItem["factoryAddress"],
  chainId: DeployedLogItem["chainId"],
) {
  const logs = getAllLogs()
  const filterLogs = logs.filter((log) => {
    return (
      log.sender.toLowerCase() === sender.toLowerCase() &&
      log.factoryAddress.toLowerCase() === factoryAddress.toLowerCase() &&
      log.chainId === chainId
    )
  })
  return filterLogs
}

export function addLog(log: DeployedLogItem) {
  unShit2ArrayStorageData(PREFIX_DEPLOYED_LOG_CACHE_KEY, log)
}
