import type { Abi } from "viem"
import type { DeployParam } from "@/types/lucky"
import {
  CODE_TYPE,
  ALLOW_FORK_ENVS,
  ALLOW_SOLC_VERSIONS,
} from "@/util/constants"

export interface IConsoleOutput {
  type: "info" | "warn" | "error"
  message: string
}

export interface IProjectCodeCompilerType {
  optimize: boolean
  isValidSolidityCode: boolean
  codeType: CODE_TYPE
  forkEnv: string
  solcVersion: string
  code: string
  contractByteCode: `0x${string}`
  abi: Abi
  constructorParamStaticTypes: string[]
}

export interface IProjectLuckySettingType {
  optimize: boolean
  isValidSolidityCode: boolean
  codeType: CODE_TYPE
  forkEnv: string
  solcVersion: string
  code: string
  contractByteCode: `0x${string}`
  // abi: Abi
  // constructorParamStaticTypes: string[]
  luckyNumberText: string
  allowDynamicConstructorParams: boolean
  constructorParams: DeployParam[]
  workerProcess: [number, number]
  factoryAddress: `0x${string}`
}

export interface IProjectComputeType {
  finalByteCode: `0x${string}`
  validLuckMatchers: string[]
}

export interface IProjectType
  extends IProjectLuckySettingType,
    IProjectComputeType {
  // isOpenCheckModal: boolean
}

export const initProject: IProjectType = {
  optimize: false,
  isValidSolidityCode: false,
  codeType: CODE_TYPE.SOLIDITY,
  forkEnv: ALLOW_FORK_ENVS[0],
  solcVersion: ALLOW_SOLC_VERSIONS[0],
  code: "",
  contractByteCode: "" as `0x${string}`,
  luckyNumberText: "",
  allowDynamicConstructorParams: false,
  constructorParams: [],
  finalByteCode: "" as `0x${string}`,
  validLuckMatchers: [],
  workerProcess: [1, 4],
  factoryAddress: "0x0000000000000000000000000000000000000000",
}

export interface IGenWorkerInput {
  workId: string
  factoryAddress: `0x${string}`
  saltStart: bigint
  saltEnd: bigint
  saltCurrent: bigint
  bytecodeHash: `0x${string}`
  matches: string[]
}

export interface IGenWorkerOutput {
  workId: string
  salt: bigint
  address: `0x${string}`
  hash: `0x${string}`
  type: "end" | "match"
  time: number
}

export interface IGenWorkerProcess {
  workId: string
  status: "running" | "end"
  saltStart: bigint
  saltEnd: bigint
  saltCurrent: bigint
}
