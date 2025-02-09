// import { keccak256 as ethereumjsKeccak256 } from "ethereumjs-util/dist/hash"
import { keccak256 as ethereumjsKeccak256 } from "ethereum-cryptography/keccak"

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

let cachedInput
let cachedFactoryAddressBytes
let cachedBytecodeHashBytes
let cachedInputLength
let hasCache = false

function computAddressWithCreate2EthereumjsUtil(
  factoryAddress,
  salt,
  bytecodeHash,
) {
  try {
    // 初始化缓存的不变参数
    if (!hasCache) {
      cachedFactoryAddressBytes = hexToUint8Array(factoryAddress.slice(2))
      cachedBytecodeHashBytes = hexToUint8Array(bytecodeHash.slice(2))
      // 预计算总长度
      cachedInputLength =
        1 +
        cachedFactoryAddressBytes.length +
        32 +
        cachedBytecodeHashBytes.length
      // 预分配固定大小的数组
      cachedInput = new Uint8Array(cachedInputLength)
      // 设置固定的值
      cachedInput[0] = 0xff
      cachedInput.set(cachedFactoryAddressBytes, 1)
      cachedInput.set(
        cachedBytecodeHashBytes,
        1 + cachedFactoryAddressBytes.length + 32,
      )
      hasCache = true
    }

    // 只处理变化的salt部分
    const saltBytes = hexToUint8Array(salt.toString(16).padStart(64, "0"))
    cachedInput.set(saltBytes, 1 + cachedFactoryAddressBytes.length)

    // 计算最终的 keccak256 哈希并转换为地址格式
    const addressBytes = ethereumjsKeccak256(cachedInput)
    return `0x${uint8ArrayToHex(addressBytes.slice(-20))}`
  } catch (error) {
    console.log(error)
  }
}

// 辅助函数：将十六进制字符串转换为 Uint8Array
function hexToUint8Array(hexString) {
  if (hexString.length % 2 !== 0) {
    hexString = "0" + hexString
  }
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.slice(i, i + 2), 16)
  }
  return bytes
}

// 辅助函数：将 Uint8Array 转换为十六进制字符串
function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

self.addEventListener(
  "message",
  (msg) => {
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

    const min = BigInt(saltStart)
    const max = BigInt(saltEnd)
    let current = saltCurrent ? BigInt(saltCurrent) : min

    const matchRegs = matches
      .map((item) => item.toLowerCase() && typeof item == "string" && item)
      .map((item) => {
        if (item.startsWith("/") && item.endsWith("/")) {
          // 修正正则表达式字符串的切片范围，应该是1到-1
          return new RegExp(item.slice(1, -1))
        }

        return new RegExp(item)
      })

    let logCount = 0

    // 校验参数错误
    checkParams(factoryAddress, current, bytecodeHash)

    while (current <= max) {
      if (logCount % progressLogInterval === 0) {
        self.postMessage({
          workerId,
          type: "log",
          address: "",
          salt: current.toString(),
          time: Date.now(),
        })
        logCount = 0
      }

      let address
      try {
        address = computAddressWithCreate2EthereumjsUtil(
          factoryAddress,
          current,
          bytecodeHash,
        )
      } catch (error) {
        self.postMessage({
          workerId,
          type: "error",
          error: error.message,
          salt: current.toString(),
          time: Date.now(),
        })
      }

      if (!address) {
        current++
        continue
      }

      address = address.toLowerCase()
      let match = false
      try {
        match = matchRegs.some((regex) => {
          return regex.test(address)
        })
      } catch (error) {
        console.error("Regex matching error:", error)
      }

      if (match) {
        // console.log(
        //   "match",
        //   address,
        //   "salt:",
        //   current.toString(),
        //   "time:",
        //   Date.now(),
        // )
        self.postMessage({
          workerId,
          type: "match",
          address,
          salt: current.toString(),
          time: Date.now(),
        })
      }
      current++
      logCount++
    }

    self.postMessage({
      workerId,
      type: "end",
      address: "",
      salt: "",
      time: Date.now(),
    })
  },
  false,
)
