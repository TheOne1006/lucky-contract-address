/**
 * TODO:
 * 1. estimateContractGas: https://viem.sh/docs/contract/estimateContractGas
 *
 */
import { useState, useEffect, useCallback } from "react"
import { toast } from "react-toastify"
import { keccak256 } from "viem"

import { GenWorkersManager } from "@/core/GenWorkersManager"
import { StorageData as GenWorkerStorageData } from "@/types/gen.worker"
import { ALLOW_CHAINS_WITH_BUILD_CONTRACT } from "@/util/constants"
import { DeployParam } from "@/types/lucky"
import { formatLuckyNumberText } from "@/util/deploy"
import { genContractByteCodeWithConstructorParams } from "@/util/abi"
import { IConsoleOutput, IProjectComputeType } from "../types"
import { useChainId } from "wagmi"

let workerManager: GenWorkersManager | undefined = undefined

export function useLuckyAddress(
  log: (msg: any, type?: IConsoleOutput["type"]) => void,
  workerNum: number,
) {
  const chainId = useChainId()

  const [finalByteCode, setFinalByteCode] =
    useState<IProjectComputeType["finalByteCode"]>("0x")
  const [validLuckMatchers, setValidLuckMatchers] = useState<
    IProjectComputeType["validLuckMatchers"]
  >([])

  const [factoryAddress, setFactoryAddress] = useState<`0x${string}`>(
    "0x0000000000000000000000000000000000000000",
  )
  const [isOpenCheckModal, setIsOpenCheckModal] = useState<boolean>(false)
  const [jobUniqueId, setJobUniqueId] = useState<string>("")
  const [uniqueIdSameToCache, setUniqueIdSameToCacahce] =
    useState<boolean>(false)
  const [isComputing, setIsComputing] = useState<boolean>(false)
  const [forceRecreate, setForceRecreate] = useState<boolean>(false)
  const [luckyAddressSaltLogs, setLuckyAddressSaltLogs] = useState<
    GenWorkerStorageData["luckAddressSaltLogs"]
  >([])

  const appendLuckyAddressSaltLogs = useCallback(
    (address: string, salt: string, time: number) => {
      setLuckyAddressSaltLogs((previous) => {
        const cloned = previous.map((x) => ({ ...x }))
        cloned.unshift({ address, salt, time })
        return cloned
      })
    },
    [setLuckyAddressSaltLogs],
  )

  useEffect(() => {
    ALLOW_CHAINS_WITH_BUILD_CONTRACT.find((item) => {
      if (item.id === chainId) {
        setFactoryAddress(item.factoryAddress as `0x${string}`)
      }
    })
  }, [chainId])

  useEffect(() => {
    const [_projectTitle, _factoryAddress] = jobUniqueId.split("-")

    if (
      !_projectTitle ||
      !_factoryAddress ||
      !finalByteCode ||
      !validLuckMatchers.length
    ) {
      return
    }
    const bytecodeHash = keccak256(finalByteCode)
    // const bytecodeHash = ethereumjsKeccak256(
    //   Buffer.from(finalByteCode.slice(2), "hex"),
    // )
    log("gen workers starting...")

    try {
      log("------------------------------")
      log(`project title: ${_projectTitle}`)
      log(`factory address: ${_factoryAddress}`)
      log(`luckNumber: ${validLuckMatchers.join(",")}`)
      log(`init worker num: ${workerNum}`)
      log(`forceRecreate: ${forceRecreate}`)
      log(
        `bytecodeHash: ${bytecodeHash.slice(0, 10)}...${bytecodeHash.slice(-8)}`,
      )
      log("------------------------------")

      workerManager = new GenWorkersManager(
        _projectTitle,
        factoryAddress,
        bytecodeHash,
        validLuckMatchers,
        workerNum,
        forceRecreate,
        (msg, type) => {
          log(msg, type as any)
        },
        appendLuckyAddressSaltLogs,
      )

      // const
      const saltLogs = workerManager
        .getLuckAddressSaltLogs()
        .map((item) => ({ ...item }))

      setLuckyAddressSaltLogs(saltLogs)
      log("start all gen workers")
      setIsComputing(true)
    } catch (error: any) {
      const errorMsg =
        error?.message || "gen workers start failed, please check your params"
      log(errorMsg, "error")
      setIsComputing(false)
      setLuckyAddressSaltLogs([])
    }

    return () => {
      log("stop all gen workers")
      if (workerManager) {
        workerManager.stopAll()
      }
      workerManager = undefined
      setIsComputing(false)
      // setLuckyAddressSaltLogs([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobUniqueId])

  useEffect(() => {
    if (workerManager) {
      workerManager.changeWorkerNum(workerNum)
    }
  }, [workerNum])

  function _genFinalByteCode(
    _contractByteCode: `0x${string}`,
    _params: DeployParam[],
  ): `0x${string}` | undefined {
    try {
      const bytecode = genContractByteCodeWithConstructorParams(
        _contractByteCode,
        _params,
      )
      return bytecode
    } catch (error: any) {
      log(error?.message, "error")
      toast.error(error?.message)
    }
  }

  function openCheckModal(
    _projectTitle: string,
    _contractByteCode: `0x${string}`,
    _params: DeployParam[],
    _luckNumberText: string,
  ) {
    const finalCode = _genFinalByteCode(_contractByteCode, _params)
    const _validLuckMatchers = formatLuckyNumberText(_luckNumberText)

    setValidLuckMatchers(_validLuckMatchers)
    if (!finalCode) {
      return
    }
    setFinalByteCode(finalCode)
    setIsOpenCheckModal(true)

    const bytecodeHash = keccak256(finalCode)

    const sameIdOnCache = GenWorkersManager.checkCacheUniqueIdMatch(
      _projectTitle,
      factoryAddress,
      bytecodeHash,
      _validLuckMatchers,
    )

    setUniqueIdSameToCacahce(sameIdOnCache)
    setForceRecreate(false)
  }

  function closeCheckModal() {
    setIsOpenCheckModal(false)
  }

  /**
   * ===========================
   * load from local storage
   * ===========================
   */
  function save2LuckAddress(data: IProjectComputeType) {
    setFinalByteCode(data.finalByteCode)
    setValidLuckMatchers(data.validLuckMatchers)
  }

  function startSearch(_projectTitle: string) {
    if (!_projectTitle) {
      toast.error("project title is empty")
      return
    } else if (!factoryAddress) {
      toast.error("factory address is empty")
      return
    }
    // start search and close modal
    setJobUniqueId(`${_projectTitle}-${factoryAddress}`)
    setIsOpenCheckModal(false)
  }
  function stopSearch() {
    setJobUniqueId("")
  }

  return {
    finalByteCode,
    isOpenCheckModal,
    setIsOpenCheckModal,
    closeCheckModal,
    openCheckModal,
    validLuckMatchers,
    save2LuckAddress,
    factoryAddress,
    isComputing,
    startSearch,
    stopSearch,
    onSetForceRecreate: setForceRecreate,
    forceRecreate,
    uniqueIdSameToCache,
    luckyAddressSaltLogs,
  }
}
