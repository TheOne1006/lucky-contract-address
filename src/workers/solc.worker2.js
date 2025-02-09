// importScripts(
//   "https://binaries.soliditylang.org/bin/soljson-v0.8.28+commit.7893614a.js",
// )

const ALLOW_SOLC_VERSIONS = [
  "v0.8.28+commit.7893614a",
  "v0.8.27+commit.40a35a09",
  "v0.8.26+commit.8a97fa7a",
]

let importSuccess = false
let compiler = null

import wrapper from "solc/wrapper"
function loadCompiler(version) {
  // check version in ALLOW_SOLC_VERSIONS
  if (!ALLOW_SOLC_VERSIONS.includes(version)) {
    return false
  }

  if (importSuccess) {
    return true
  }

  const url = `https://binaries.soliditylang.org/bin/soljson-${version}.js`
  try {
    // eslint-disable-next-line no-undef
    importScripts(url)
    compiler = wrapper(self.Module)
    importSuccess = true
  } catch (e) {
    console.error("failed to load compiler version", version, url, e)
    return false
  }

  return true
}

/**
 *
 * @param {string} source solidity source code
 * @param {string} evmVersion evm version
 * @param {boolean} optim optimize or nots
 */
function compile(source, evmVersion = "cancun", optim = false) {
  // const version = compiler.version()
  const contract = "Contract.sol"
  // https://docs.soliditylang.org/en/v0.5.0/using-the-compiler.html#compiler-input-and-output-json-description
  const input = {
    language: "Solidity",
    sources: {
      [contract]: {
        content: source,
      },
    },
    settings: {
      evmVersion,
      optimizer: {
        enabled: optim,
        runs: 200,
      },
      outputSelection: {
        "*": {
          // "*": ["abi", "evm.bytecode"],
          "*": ["*"],
        },
      },
    },
  }

  const startTime = performance.now()

  const compileObject = compiler.compile(JSON.stringify(input))

  const endTime = performance.now()
  console.log(`Compilation took ${(endTime - startTime).toFixed(2)}ms`)

  // 编译合约
  const output = JSON.parse(compileObject)

  if (output.errors) {
    console.error("compile error", output.errors)
    const error = new Error(output.errors[0].formattedMessage)
    throw error
  }

  // 获取合约名称（从编译输出中获取第一个合约）
  const contracts = output.contracts[contract]
  const contractName = Object.keys(contracts)[0]

  if (!contractName) {
    throw new Error("未找到合约")
  }

  // deployedBytecode（运行时字节码） ：
  // console.log(contracts[contractName].evm.deployedBytecode.object)

  // 获取部署字节码 hex strings
  const bytecode = contracts[contractName].evm.bytecode.object

  if (!bytecode) {
    throw new Error("Not found bytecode")
  }

  let createGasEstimates = "infinite"
  try {
    createGasEstimates =
      contracts[contractName].evm.gasEstimates.creation.totalCost
  } catch (e) {
    console.error("Error getting deployment gas estimate", e)
  }

  return {
    version: compiler.version(),
    // 部署字节码 hex strings
    bytecode: `0x${bytecode}`,
    // 部署 gas 的估计
    createGasEstimates,
    // 构造函数的参数
    abi: contracts[contractName].abi,
  }
}

self.addEventListener(
  "message",
  (msg) => {
    let { solcVersion, code, evmVersion } = msg.data

    if (!loadCompiler(solcVersion)) {
      self.postMessage({
        error: `failed to load compiler ${solcVersion}`,
      })
      return
    }

    try {
      const result = compile(code, evmVersion)
      self.postMessage(result)
    } catch (e) {
      console.error(e)
      self.postMessage({
        error: e.message,
      })
    }

    // self.postMessage({
    //   version: compiler.version(),
    // })
  },
  false,
)
