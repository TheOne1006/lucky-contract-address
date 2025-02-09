import type { Abi } from "viem"
// 导入不同版本的 solc
import solc_0_8_28 from "solc-0.8.28"
import solc_0_8_27 from "solc-0.8.27"
import solc_0_8_26 from "solc-0.8.26"

// import { ALLOW_SOLC_VERSIONS } from "@/util/common.constants"

interface CompilerInput {
  language: string
  sources: {
    [key: string]: {
      content: string
    }
  }
  settings: {
    evmVersion: string
    optimizer: {
      enabled: boolean
      runs: number
    }
    outputSelection: {
      "*": {
        "*": string[]
      }
    }
  }
}

export function compile(
  sourceCode: string,
  fileName: string = "Test.sol",
  solcVersion: string = "v0.8.28+commit.7893614a",
  evmVersion: string = "cancun",
  optimizer: boolean = false,
): {
  bytecode: string
  abi: Abi
} {
  // 移除 + 后面的内容
  let version = solcVersion
  const inputSolcVersionSplitArray = solcVersion.split("+")
  if (inputSolcVersionSplitArray.length > 1) {
    version = inputSolcVersionSplitArray[0]
  }
  // 移除 v 前缀
  version = version.replace("v", "")

  let solc = solc_0_8_28
  const solc_0_8_28_version = solc_0_8_28.version()

  if (solc_0_8_28_version.match(version)) {
    solc = solc_0_8_28
  } else if (solc_0_8_27.version().match(version)) {
    solc = solc_0_8_27
  } else if (solc_0_8_26.version().match(version)) {
    solc = solc_0_8_26
  } else {
    throw new Error(
      `选择版本 ${version} 不支持, 当前支持 solc 版本 [${solc_0_8_28_version}, ${solc_0_8_27.version()}, ${solc_0_8_26.version()}]`,
    )
  }

  const input: CompilerInput = {
    language: "Solidity",
    sources: {
      [fileName]: {
        content: sourceCode,
      },
    },
    settings: {
      evmVersion,
      optimizer: {
        enabled: optimizer,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
          // "*": ["*"],
        },
      },
    },
  }

  // 检查 solc 版本
  // const version = solc.version()

  // console.log("solc version: ", version)

  const compileObject = solc.compile(JSON.stringify(input))

  // 编译合约
  const output = JSON.parse(compileObject)

  // 检查编译错误
  if (output.errors) {
    const errors = output.errors.filter(
      (error: any) => error.severity === "error",
    )
    if (errors.length > 0) {
      throw new Error(
        `编译错误：${errors.map((e: any) => e.message).join("\n")}`,
      )
    }
  }

  // 获取合约名称（从编译输出中获取第一个合约）
  const contracts = output.contracts[fileName]
  const contractName = Object.keys(contracts)[0]

  if (!contractName) {
    throw new Error("未找到合约")
  }

  // deployedBytecode（运行时字节码） ：
  // console.log(contracts[contractName].evm.deployedBytecode.object)

  // 获取部署字节码
  const bytecode = contracts[contractName].evm.bytecode.object

  if (!bytecode) {
    throw new Error("获取字节码")
  }
  const abi = contracts[contractName].abi

  return {
    bytecode,
    abi,
  }
}
