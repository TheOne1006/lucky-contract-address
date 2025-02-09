import init, { compute_create2_address } from "./keccak_wasm.js"

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

let cachedFactoryAddressBytes
let cachedBytecodeHashBytes
let hasCache = false

function computAddressWithCreate2EthereumjsUtil(
  factoryAddress,
  salt,
  bytecodeHash,
) {
  try {
    const saltBytes = hexToBytes(salt.toString())

    if (!hasCache) {
      cachedFactoryAddressBytes = hexToBytes(factoryAddress)
      cachedBytecodeHashBytes = hexToBytes(bytecodeHash)
      hasCache = true
    }

    const result = compute_create2_address(
      cachedFactoryAddressBytes,
      saltBytes,
      cachedBytecodeHashBytes,
    )

    const hexResult = Array.from(result)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    const address = "0x" + hexResult.slice(24) // Take last 20

    return address
  } catch (error) {
    console.log(error)
  }
}

function hexToBytes(hex) {
  hex = hex.replace("0x", "")
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

self.addEventListener(
  "message",
  async (msg) => {
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

    await init()

    const min = BigInt(saltStart)
    const max = BigInt(saltEnd)
    let current = saltCurrent ? BigInt(saltCurrent) : min

    checkParams(factoryAddress, current, bytecodeHash)

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
        // console.log("debug", address)
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
