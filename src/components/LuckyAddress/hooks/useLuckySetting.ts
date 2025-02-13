import { useState, useEffect, useCallback } from "react"
import { toast } from "react-toastify"
import { useChainId } from "wagmi"
import type { Abi } from "viem"
import {
  ALLOW_CODE_TYPES,
  ALLOW_FORK_ENVS,
  ALLOW_SOLC_VERSIONS,
  CODE_TYPE,
  ALLOW_CHAINS_WITH_BUILD_CONTRACT,
} from "@/util/constants"

import type { DeployParam } from "@/types/lucky"
import { validateSolidityCode } from "@/util/solidity"
import { parseConstructorParamsTypes } from "@/util/abi"
import { IProjectLuckySettingType, IConsoleOutput } from "../types"

export function useLuckySetting(
  log: (err: any, type?: IConsoleOutput["type"]) => void,
) {
  const chainId = useChainId()
  const [luckyNumberText, setLuckyNumberText] =
    useState<IProjectLuckySettingType["luckyNumberText"]>("")
  const [allowDynamicConstructorParams, setAllowDynamicConstructorParams] =
    useState<IProjectLuckySettingType["allowDynamicConstructorParams"]>(false)
  const [constructorParams, setConstructorParams] = useState<
    IProjectLuckySettingType["constructorParams"]
  >([])
  const [factoryAddress, setFactoryAddress] = useState<
    IProjectLuckySettingType["factoryAddress"]
  >("0x0000000000000000000000000000000000000000")
  const [workerProcess, setWorkerProcess] = useState<
    IProjectLuckySettingType["workerProcess"]
  >([1, 4])

  const [optimize, setOptimize] =
    useState<IProjectLuckySettingType["optimize"]>(false)
  const [isValidSolidityCode, setIsValidSolidityCode] =
    useState<IProjectLuckySettingType["isValidSolidityCode"]>(false)
  const [codeType, setCodeType] = useState<
    IProjectLuckySettingType["codeType"]
  >(ALLOW_CODE_TYPES[0])
  const [forkEnv, setForkEnv] = useState<IProjectLuckySettingType["forkEnv"]>(
    ALLOW_FORK_ENVS[0],
  )
  const [solcVersion, setSolcVersion] = useState<
    IProjectLuckySettingType["solcVersion"]
  >(ALLOW_SOLC_VERSIONS[0])
  const [code, setCode] = useState<IProjectLuckySettingType["code"]>("") // solidity code or bytecode
  const [contractByteCode, setContractByteCode] = useState<
    IProjectLuckySettingType["contractByteCode"]
  >("" as `0x${string}`)

  const [compiling, setIsCompiling] = useState(false)
  function onCodeTypeChange(codeType: CODE_TYPE) {
    setCodeType(codeType)
    setCode("")
    setContractByteCode("" as `0x${string}`)

    if (codeType === CODE_TYPE.BYTECODE) {
      setAllowDynamicConstructorParams(true)
    } else {
      setAllowDynamicConstructorParams(false)
    }
    setConstructorParams([])
  }

  function onCodeChange(newCode: string, _codeType: CODE_TYPE) {
    setCode(newCode)
    if (_codeType === CODE_TYPE.SOLIDITY) {
      const valid = validateSolidityCode(newCode)
      setIsValidSolidityCode(valid)
    }
  }

  /**
   * compile solidity code to bytecode
   * @param _code
   * @param _codeType
   * @param _solcVersion
   * @param _forkEnv
   */
  async function genByteCode(
    _code: string,
    _codeType: string,
    _solcVersion: string,
    _forkEnv: string,
  ) {
    if (_codeType === CODE_TYPE.SOLIDITY) {
      try {
        setIsCompiling(true)
        log("Starting compilation...")

        const response = await fetch("/api/compileSolidity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: _code,
            version: _solcVersion,
            evmVersion: _forkEnv,
            optimizer: optimize,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "编译失败")
        }

        const { bytecode, abi } = data as {
          bytecode: `0x${string}`
          abi: Abi
        }
        log("Compilation successful")

        const _constructorTypes = parseConstructorParamsTypes(abi)
        const _deployParams = _constructorTypes.map((type, index) => {
          return {
            id: index,
            type: type,
            value: "",
          }
        })
        setContractByteCode(bytecode)
        setAllowDynamicConstructorParams(false)

        setConstructorParams(_deployParams)
      } catch (error: any) {
        log(error.message, "error")
        log("Compilation stopped", "error")
        toast.error(error.message)
        setContractByteCode(`0x`)
        setConstructorParams([])
      } finally {
        setIsCompiling(false)
      }
    } else {
      setContractByteCode(_code as `0x${string}`)
    }
  }

  useEffect(() => {
    ALLOW_CHAINS_WITH_BUILD_CONTRACT.find((item) => {
      if (item.id === chainId) {
        setFactoryAddress(item.factoryAddress as `0x${string}`)
      }
    })
  }, [chainId])

  const refreshFactoryAddress = useCallback(() => {
    ALLOW_CHAINS_WITH_BUILD_CONTRACT.find((item) => {
      if (item.id === chainId) {
        setFactoryAddress(item.factoryAddress as `0x${string}`)
      }
    })
  }, [chainId])

  function onConstructorParamsAppend(param: DeployParam) {
    setConstructorParams((prev) => {
      const copyPrev = [...prev]
      copyPrev.push(param)
      return copyPrev
    })
  }

  function onConstructorParamsDelect(id: number) {
    setConstructorParams((prev) => {
      const copyPrev = [...prev]
      return copyPrev.filter((item) => item.id !== id)
    })
  }

  // 自定义构造参数 set
  function onConstructorParamsChange(param: DeployParam, id: number) {
    setConstructorParams((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          return {
            ...param,
            id: id,
          }
        }
        return item
      })
      return next
    })
  }

  function save2LuckySetting(data: IProjectLuckySettingType) {
    setOptimize(data.optimize)
    setIsValidSolidityCode(data.isValidSolidityCode)
    setCodeType(data.codeType)
    setForkEnv(data.forkEnv)
    setSolcVersion(data.solcVersion)
    setCode(data.code)
    setContractByteCode(data.contractByteCode)
    setLuckyNumberText(data.luckyNumberText)
    setAllowDynamicConstructorParams(data.allowDynamicConstructorParams)

    setConstructorParams(data.constructorParams)
    setWorkerProcess([...data.workerProcess])
    // setFactoryAddress(data.factoryAddress)
  }
  //

  return {
    // compiler
    codeType,
    forkEnv,
    solcVersion,
    optimize,
    onCodeTypeChange,
    onCodeChange,
    onForkEnvChange: setForkEnv,
    onSolcVersionChange: setSolcVersion,
    onOptimizeChange: setOptimize,
    code,
    genByteCode,
    compiling,
    isValidSolidityCode,
    contractByteCode,
    // setting
    luckyNumberText,
    onLuckNumberTextChange: setLuckyNumberText,
    allowDynamicConstructorParams,
    constructorParams,
    onConstructorParamsAppend,
    onConstructorParamsDelect,
    onConstructorParamsChange,
    save2LuckySetting,
    factoryAddress,
    workerProcess,
    onWorkerProcessChange: setWorkerProcess,
    refreshFactoryAddress,
  }
}
