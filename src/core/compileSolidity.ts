// 基于 solc 的 worker，用于编译 solidity 代码
import solc from "solc"

interface CompilerInput {
  language: string
  sources: {
    [key: string]: {
      content: string
    }
  }
  settings: {
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
): string {
  const input: CompilerInput = {
    language: "Solidity",
    sources: {
      [fileName]: {
        content: sourceCode,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
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
  const bytecode: string = contracts[contractName].evm.bytecode.object

  if (!bytecode) {
    throw new Error("获取字节码")
  }

  return `0x${bytecode}`
}
