export enum WorkerStatus {
  IDLE = "idle",
  RUNNING = "running",
  STOPPED = "stopped",
  WAIT = "waiting",
  FINISHED = "finished",
}

export type WorkerItem = {
  workerId: string
  params: {
    factoryAddress: string
    bytecodeHash: string
    matches: string[]
  }
  status: WorkerStatus
  saltStart: bigint
  saltEnd: bigint
  saltCurrent: bigint
  worker?: Worker
}

export type StorageData = {
  projectTitle: string
  factoryAddress: string
  bytecodeHash: string
  matches: string[]
  uniqueId: string
  luckAddressSaltLogs: {
    salt: string
    address: string
    time: number
  }[]
  currentSalts: (bigint | string)[]
}

export interface IGenWorkerInput {
  workerId: string
  factoryAddress: `0x${string}`
  saltStart: bigint
  saltEnd: bigint
  saltCurrent: bigint
  bytecodeHash: `0x${string}`
  matches: string[]
  progressLogInterval: number
}

export enum GenWorkerOutputType {
  END = "end",
  MATCH = "match",
  LOG = "log",
}

export interface IGenWorkerOutput {
  workerId: string
  salt: bigint
  address: `0x${string}`
  type: GenWorkerOutputType
  error: string
  time: number
}
