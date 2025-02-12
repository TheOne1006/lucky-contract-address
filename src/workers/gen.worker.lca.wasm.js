/**
 * 增加 batch 模式
 */
import init, {
  compute_ready,
  // compute_next,
  compute_batch,
} from "./worker_lca.js"

function checkParams(factoryAddress, salt, bytecodeHash) {
  // 校验输入参数 factoryAddress、salt、bytecodeHash 是否符合要求
  if (
    !factoryAddress ||
    typeof factoryAddress !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(factoryAddress)
  ) {
    throw new Error(
      `Invalid factory address format, error factoryAddress: ${factoryAddress}`,
    )
  }

  if (
    !bytecodeHash ||
    typeof bytecodeHash !== "string" ||
    !/^0x[0-9a-fA-F]{64}$/.test(bytecodeHash)
  ) {
    throw new Error(
      `Invalid bytecode hash format, error bytecodeHash: ${bytecodeHash}`,
    )
  }

  if (!salt || typeof salt !== "bigint") {
    throw new Error(`Invalid salt format, error salt: ${salt}`)
  }
}

function hexToBytes(hex) {
  hex = hex.replace("0x", "")
  const len = hex.length >> 1
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(hex.substr(i << 1, 2), 16)
  }
  return bytes
}

// 预编译正则表达式
function compileMatches(matches) {
  return matches
    .map((item) => {
      const pattern = item.toLowerCase()
      if (typeof pattern !== "string") return null
      if (pattern.startsWith("/") && pattern.endsWith("/")) {
        return new RegExp(pattern.slice(1, -1), "i")
      }
      return pattern
    })
    .filter(Boolean)
}

function processHashMatch(worker, hash, workerId, matchRegs) {
  const colonIndex = hash.indexOf(":")
  if (colonIndex === -1) {
    throw new Error("Invalid hash format")
  }

  const address = `0x${hash.slice(24, colonIndex)}`
  const salt = `0x${hash.slice(colonIndex + 1, colonIndex + 65)}`

  for (const pattern of matchRegs) {
    if (
      (typeof pattern === "string" && address.includes(pattern)) ||
      (pattern instanceof RegExp && pattern.test(address))
    ) {
      worker.postMessage({
        workerId,
        type: "match",
        address,
        salt,
        time: Date.now(),
      })
      break
    }
  }
}

self.addEventListener("message", async (msg) => {
  let {
    workerId,
    factoryAddress,
    saltStart,
    saltEnd,
    saltCurrent,
    bytecodeHash,
    matches,
    progressLogInterval,
  } = msg.data

  await init("./worker_lca_bg.wasm")

  const min = BigInt(saltStart)
  const max = BigInt(saltEnd)
  let current = saltCurrent ? BigInt(saltCurrent) : min

  checkParams(factoryAddress, current, bytecodeHash)

  const saltBytes = hexToBytes(current.toString())
  const factoryAddressBytes = hexToBytes(factoryAddress)
  const bytecodeHashBytes = hexToBytes(bytecodeHash)

  compute_ready(factoryAddressBytes, saltBytes, bytecodeHashBytes)

  const matchRegs = compileMatches(matches)

  while (current <= max) {
    try {
      const result = compute_batch(progressLogInterval)

      result.forEach((item) => {
        const hash = item.toLowerCase()
        processHashMatch(self, hash, workerId, matchRegs)
      })

      // 获取最后一个结果
      if (result.length > 0) {
        const lastItem = result[result.length - 1]
        const parts = lastItem.split(":")
        const salt = `0x${parts[1].slice(0, 64)}`

        try {
          current = BigInt(salt)
        } catch (error) {
          console.error("Error parsing salt:", lastItem)
        }
        // current = BigInt(salt)

        // log
        self.postMessage({
          workerId,
          type: "log",
          address: "",
          salt: salt,
          time: Date.now(),
        })
      }
    } catch (error) {
      self.postMessage({
        workerId,
        type: "error",
        error: error.message,
        salt: current.toString(),
        time: Date.now(),
      })
    }
  }

  self.postMessage({
    workerId,
    type: "end",
    address: "",
    salt: "",
    time: Date.now(),
  })
})
