import { toast } from "react-toastify"
import { keccak256 } from "viem"
import {
  loadStorageData,
  save2StorageData,
  deleteStorageData,
} from "@/util/storage"
// import { jsonStringify } from "@/util/string"
import {
  WORKERS_PREFIX,
  MAX_ENABLE_WORKERS,
  MAX_WORKERS,
  MAX_SALT,
} from "@/util/constants"

import {
  WorkerStatus,
  WorkerItem,
  StorageData,
  IGenWorkerInput,
  IGenWorkerOutput,
  GenWorkerOutputType,
} from "@/types/gen.worker"
import { jsonStringify } from "@/util/string"

const workerSize = MAX_SALT / BigInt(MAX_WORKERS)

export class GenWorkersManager {
  private workers: WorkerItem[] = []
  private projectTitle = ""
  private commonParams: WorkerItem["params"]
  // localStorage Memory MAX 5M
  private luckAddressSaltLogs: StorageData["luckAddressSaltLogs"] = []
  private luckAddressSaltLogsMax = 10_000
  private uniqueId: string
  private enableNumber = 0
  private log: (
    workerIdOrManager: string,
    action: string,
    msg: any,
    type?: any,
  ) => void
  private workerBatchSize = Number(
    process.env.NEXT_PUBLIC_WORKER_BATCH_SIZE ?? 1_000_000,
  ) // 100 w
  private workerLogInterval = Number(
    process.env.NEXT_PUBLIC_WORKER_LOG_INTERVAL ?? 10,
  )
  private logSuccess: (address: string, salt: string, time: number) => void

  public constructor(
    projectTitle: string,
    factoryAddress: `0x${string}`,
    bytecodeHash: `0x${string}`,
    matches: string[],
    enableNumber = 0,
    forceRecreate = false,
    log: (msg: any, type?: string) => void,
    logSuccess: (address: string, salt: string, time: number) => void,
  ) {
    const params: WorkerItem["params"] = {
      factoryAddress,
      bytecodeHash,
      matches,
    }
    this.log = GenWorkersManager.wrapperLog(log)
    this.logSuccess = logSuccess
    this.projectTitle = projectTitle
    this.commonParams = params
    this.uniqueId = GenWorkersManager.generateUniqueId(projectTitle, params)
    this.enableNumber = enableNumber

    this.initAllWorkers()
    if (!forceRecreate) {
      this.loadFromCache()
    } else {
      // clear same attribute
      this.uniqueId = ""
      this.luckAddressSaltLogs = []
    }

    if (enableNumber > 0) {
      this.startAll()
    }
  }

  static wrapperLog(baseLog: (msg: string, type?: string) => void) {
    return (
      workerIdOrManager: string = "WorkerManager",
      action: string = "info",
      msg: string,
      type?: string,
    ) => {
      const now = new Date().toLocaleTimeString()
      const prefix = `[${now} ${workerIdOrManager}] (${action})`
      baseLog(`${prefix} ${msg}`, type)
    }
  }

  /**
   * AddressSaltLogs append
   * @param address
   * @param salt
   * @param time
   */
  private appendAddrressSaltLog(address: string, salt: string, time: number) {
    if (this.luckAddressSaltLogs.length >= this.luckAddressSaltLogsMax) {
      this.luckAddressSaltLogs.shift()
    }
    // todo 根据 address 去重
    const exist = this.luckAddressSaltLogs.find((l) => l.address === address)
    if (exist) {
      return
    }

    this.luckAddressSaltLogs.push({
      address,
      salt,
      time,
    })
    this.logSuccess(address, salt, time)
  }

  private initAllWorkers() {
    const _workers: WorkerItem[] = []

    for (let i = 0; i < MAX_WORKERS; i++) {
      let saltStart = BigInt(i) * workerSize
      const saltEnd = saltStart + workerSize

      if (i == 0) {
        // 防止 saltStart 为 0
        saltStart = BigInt(1)
      }

      const workerId = `worker-${i + 1}`
      const item: WorkerItem = {
        workerId,
        params: this.commonParams,
        status: WorkerStatus.WAIT,
        saltStart,
        saltEnd,
        saltCurrent: saltStart,
      }

      _workers.push(item)
    }

    // const saltStarts = _workers.map((w) =>
    //   w.saltStart.toString(16).padStart(64, "0"),
    // )
    // current.toString(16).padStart(64, "0")
    // console.log(`initAllWorkers: saltStarts: ${jsonStringify(saltStarts)}`)

    this.workers = _workers
  }

  public static generateUniqueId(
    projectTitle: string,
    params: WorkerItem["params"],
  ): string {
    const data = {
      title: projectTitle,
      factory: params.factoryAddress,
      bytecode: params.bytecodeHash,
      matches: params.matches.map((m) => m.toString()),
    }

    return keccak256(Buffer.from(JSON.stringify(data)))
  }

  public static checkCacheUniqueIdMatch(
    projectTitle: string,
    factoryAddress: string,
    bytecodeHash: string,
    matches: string[],
  ): boolean {
    const key = GenWorkersManager.genCacheKey(projectTitle)
    const data = loadStorageData<StorageData | null>(key, null)

    if (!data) return true
    const _params = {
      factoryAddress,
      bytecodeHash,
      matches,
    }

    const inputUnique = GenWorkersManager.generateUniqueId(
      projectTitle,
      _params,
    )
    return inputUnique === data.uniqueId
  }

  static genCacheKey(projectTitle: string): string {
    return `${WORKERS_PREFIX}${projectTitle}`
  }

  private loadFromCache() {
    const projectTitle = this.projectTitle
    const key = GenWorkersManager.genCacheKey(projectTitle)
    const data = loadStorageData<StorageData | null>(key, null)

    if (!data) return
    if (this.workers.length != MAX_WORKERS) return
    if (data.currentSalts.length != MAX_WORKERS) return

    const cacheBuildUniqueId = GenWorkersManager.generateUniqueId(
      projectTitle,
      {
        factoryAddress: data.factoryAddress,
        bytecodeHash: data.bytecodeHash,
        matches: data.matches,
      },
    )

    if (this.uniqueId !== cacheBuildUniqueId) {
      throw new Error(
        "Cache unique ID mismatch - stored data is from a different configuration",
      )
    } else if (this.uniqueId !== data.uniqueId) {
      throw new Error("Cache unique ID mismatch")
    }

    this.luckAddressSaltLogs = data.luckAddressSaltLogs

    // update workers.currentSalt
    this.workers.forEach((worker, index) => {
      worker.saltCurrent = data.currentSalts[index]
    })
  }

  private toastCount = 0
  private lastToastReset = Date.now()
  private MAX_TOAST_PER_WINDOW = 3
  private readonly TOAST_WINDOW = 10000 // 10 seconds

  private showToast(message: string) {
    const now = Date.now()
    if (now - this.lastToastReset >= this.TOAST_WINDOW) {
      this.toastCount = 0
      this.lastToastReset = now
    }

    if (this.toastCount < this.MAX_TOAST_PER_WINDOW) {
      toast.info(message)
      this.toastCount++
    }
  }

  private startWorker(index: number): void {
    if (index >= 0 && index < this.workers.length) {
      const item = this.workers[index]
      const worker = new Worker("/workers/gen.worker.js")

      if (item.worker) {
        this.log(item.workerId, "warn", "already exists!")
        return
      }

      item.status = WorkerStatus.RUNNING
      item.worker = worker

      // 用于计算效率
      let preTime: number = 0
      let curCount: number = 0

      worker.onmessage = (event) => {
        const { workerId, salt, address, type, time, error } =
          event.data as IGenWorkerOutput

        if (error) {
          this.log(workerId, "error", error, "error")
          // close worker
          item.status = WorkerStatus.STOPPED
          item.worker?.terminate()
          item.worker = undefined
          return
        }

        if (type === GenWorkerOutputType.END) {
          item.saltCurrent = item.saltEnd
          item.status = WorkerStatus.FINISHED
          worker.terminate()
          this.saveToCache()
          setTimeout(() => {
            this.changeWorkerNum(this.enableNumber)
          }, 1000)
        } else if (type === GenWorkerOutputType.MATCH) {
          this.log(workerId, "match", `find address: ${address} with ${salt}`)
          this.showToast("find address: " + address)
          this.appendAddrressSaltLog(address.toString(), salt.toString(), time)
          // update worker
          item.saltCurrent = salt
        } else if (type === GenWorkerOutputType.LOG) {
          item.saltCurrent = salt

          const now = Date.now()

          if (preTime && curCount % this.workerLogInterval == 0) {
            this.log(workerId, "log", `update current: ${salt}`)
            this.saveToCache()
            curCount = 0
            // curCount = 0
            // ~ 60k ops
            const elapsedSeconds = (now - preTime) / 1000
            const speed = this.workerBatchSize / elapsedSeconds

            this.log(
              workerId,
              "log",
              `speed: ${speed.toLocaleString(undefined, { maximumFractionDigits: 2 })} ops/s`,
            )
          }
          curCount++
          preTime = now
        } else {
          this.log(workerId, "warn", `not found type: ${type}`)
        }
      }

      worker.postMessage({
        workerId: item.workerId,
        factoryAddress: item.params.factoryAddress,
        saltStart: item.saltStart,
        saltEnd: item.saltEnd,
        saltCurrent: item.saltCurrent,
        bytecodeHash: item.params.bytecodeHash,
        matches: item.params.matches,
        progressLogInterval: this.workerBatchSize,
      } as IGenWorkerInput)

      this.log(item.workerId, "info", "starting...")
      //
      this.log(
        item.workerId,
        "info",
        `start saltCurrent: 0x${item.saltCurrent.toString(16).padStart(64, "0")}`,
      )
    }
  }

  private stopWorker(index: number): void {
    if (index >= 0 && index < this.workers.length) {
      // save to cache
      const item = this.workers[index]

      if (item.status == WorkerStatus.RUNNING || !!item.worker) {
        item.status = WorkerStatus.STOPPED
        item.worker?.terminate()
        item.worker = undefined
        this.log(item.workerId, "info", "stopped now")
      }

      this.saveToCache()
    }
  }

  public startAll(): void {
    this.changeWorkerNum(this.enableNumber)
    this.saveToCache()
  }

  public stopAll(): void {
    this.workers.forEach((_, index) => this.stopWorker(index))
    this.saveToCache()
  }

  private lastSaveTime = 0
  public saveToCache(): void {
    const now = Date.now()

    // max 5s save once
    if (now - this.lastSaveTime < 5000) {
      return
    }
    this.lastSaveTime = now

    const projectTitle = this.projectTitle
    const key = GenWorkersManager.genCacheKey(projectTitle)
    const commonParams = this.commonParams
    const data: StorageData = {
      projectTitle,
      luckAddressSaltLogs: this.luckAddressSaltLogs,
      uniqueId: GenWorkersManager.generateUniqueId(projectTitle, commonParams),
      factoryAddress: commonParams.factoryAddress,
      bytecodeHash: commonParams.bytecodeHash || "",
      matches: commonParams.matches.map((m) => m.toString()) || [],
      currentSalts: this.workers.map((w) => w.saltCurrent) || [],
    }
    save2StorageData(key, data)
  }

  public clearCache(): void {
    this.stopAll()
    const key = GenWorkersManager.genCacheKey(this.projectTitle)
    deleteStorageData(key)
  }

  // public getWorkers(): WorkerItem[] {
  //   return this.workers
  // }

  public getRunningWorkerNumber(): number {
    return this.workers.filter((w) => w.status == WorkerStatus.RUNNING).length
  }

  /**
   * 切换 不同的 worker 数量，恢复 或者新建 worker
   */
  public changeWorkerNum(num: number) {
    // 检查输入的数量是否在允许范围内
    if (num <= 0 || num > MAX_ENABLE_WORKERS) {
      throw new Error(
        `Worker number must be between 1 and ${MAX_ENABLE_WORKERS}`,
      )
    }

    const runningNum = this.workers.filter(
      (w) => w.status == WorkerStatus.RUNNING && !!w.worker,
    ).length

    if (runningNum == num) {
      return
    }
    this.enableNumber = num
    let curIndex = 0

    const total = this.workers.length
    for (let i = 0; i < total; i++) {
      const item = this.workers[i]
      if (item.status == WorkerStatus.FINISHED) {
        continue
      }

      if (curIndex >= num) {
        // 停止超过数量的 worker
        // console.log(
        //   `stop worker i: ${i}, status: ${item.status}, has worker: ${!!item.worker}`,
        // )
        if (item.status == WorkerStatus.RUNNING || !!item.worker) {
          this.stopWorker(i)
        }
      } else {
        // 未激活的 worker 开始工作
        if (item.status != WorkerStatus.RUNNING || !item.worker) {
          this.startWorker(i)
        }

        curIndex++
      }
    }

    // 保存更改到缓存
    this.saveToCache()
  }

  public getLuckAddressSaltLogs(): StorageData["luckAddressSaltLogs"] {
    return this.luckAddressSaltLogs
  }
}
