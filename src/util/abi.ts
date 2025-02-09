// 根据 abi 解析构造函数的参数 类型
import type { Abi } from "viem"
import { encodeAbiParameters, decodeEventLog, TransactionReceipt } from "viem"
import { luckyFactoryAbi } from "@/util/LuckyFactory.abi"

import { ABI_PARAMETER_INPUT_MAP_ITEM, DeployParam } from "@/types"

/**
 * 根据 abi 解析构造函数的参数 类型
 * @param abi
 * @returns 参数类型数组
 */
export function parseConstructorParamsTypes(abi: Abi): string[] {
  const constructor = abi.find((item) => item.type === "constructor")
  if (!constructor) {
    return []
  }
  return constructor.inputs.map((input) => input.type)
}

/**
 * 根据 abi 解析构造函数的参数 类型
 * @param abi
 * @returns 参数类型数组
 */

const hexRegex = /^0x[0-9a-fA-F]+$/
const addressRegex = /^0x[0-9a-fA-F]{40}$/
const numberRegex = /^-?\d+$/
const boolRegex = /^(true|false)$/

function transform_array(value: any, name: string, reg?: RegExp) {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${name} type`)
  }
  // 移除  \[ \] 和 空格
  const cleanValue = value.replace(/[\[\] ]/g, "")
  // 分割字符串
  const values = cleanValue.split(",")

  const result: any[] = []
  // 验证每个元素是否为数字
  for (const item of values) {
    if (reg && !reg.test(item)) {
      throw new Error(`Invalid ${name} format with ${item}`)
    }
    result.push(item)
  }

  return result
}

/**
 * ABI parameter 对应的 input 类型映射
 */
export const ABI_PARAMETER_INPUT_MAP: {
  [key: string]: ABI_PARAMETER_INPUT_MAP_ITEM
} = {
  uint256: {
    inputType: "number",
    placeholder: "0",
    transform: (value: any) => {
      // 判断 value 属于 number 类型
      if (typeof value !== "string") {
        throw new Error("Invalid input type")
      }
      return BigInt(value)
    },
  },
  address: {
    regex: addressRegex,
    transform: (value: any) => {
      // value 属于 string && 处理 address 类型的输入
      if (typeof value == "string" && addressRegex.test(value)) {
        return value
      } else {
        throw new Error("Invalid address format")
      }
    },
  },
  bytes: {
    inputType: "textarea",
    regex: hexRegex,
    placeholder: "0x1212123",
    transform: (value: any) => {
      // 处理 bytes 类型的输入
      if (typeof value == "string" && hexRegex.test(value)) {
        return value
      } else {
        throw new Error("Invalid bytes format")
      }
    },
  },
  string: {
    transform: (value: any) => {
      // 处理 bytes 类型的输入
      if (typeof value == "string") {
        return value
      } else {
        throw new Error("Invalid string format")
      }
    },
  },
  bool: {
    element: "select",
    options: [false, true],
    transform: (value: any) => {
      // 处理 bytes 类型的输入
      if (typeof value !== "boolean") {
        return value
      } else {
        throw new Error("Invalid bytes format")
      }
    },
  },
  int256: {
    inputType: "number",
    transform: (value: any) => {
      // 判断 value 属于 number 类型
      if (typeof value !== "string") {
        throw new Error("Invalid input type")
      }
      return BigInt(value)
    },
  },
  "uint256[]": {
    element: "textarea",
    regex: numberRegex,
    isArray: true,
    placeholder: `examples: [1111, 2222]`,
    transform: (value: any) => {
      return transform_array(value, "uint256[]", numberRegex)
    },
  },
  "int256[]": {
    element: "textarea",
    regex: numberRegex,
    isArray: true,
    placeholder: `examples: [1111, 2222]`,
    transform: (value: any) => {
      return transform_array(value, "int256[]", numberRegex)
    },
  },
  "address[]": {
    element: "textarea",
    regex: addressRegex,
    isArray: true,
    placeholder: `examples: [0xaddren1xxxxxx, 0xaddren2xxxxxx]`,
    transform: (value: any) => {
      return transform_array(value, "address[]", addressRegex)
    },
  },
  "bytes[]": {
    element: "textarea",
    regex: hexRegex,
    isArray: true,
    placeholder: `examples: [0x1212123, 0x12123221]`,
    transform: (value: any) => {
      return transform_array(value, "bytes[]", hexRegex)
    },
  },
  "string[]": {
    element: "textarea",
    isArray: true,
    placeholder: `examples: [sakjksd, dsdaasd]`,
    transform: (value: any) => {
      return transform_array(value, "string[]")
    },
  },
  "bool[]": {
    element: "textarea",
    regex: boolRegex,
    isArray: true,
    placeholder: `examples: [true, false]`,
    transform: (value: any) => {
      const valueLower = value.toLowerCase()
      const lower_array = transform_array(valueLower, "bool[]", boolRegex)
      return lower_array.map((item) => {
        if (item === "true") {
          return true
        } else {
          return false
        }
      })
    },
  },
}

function transform_deploy_params(_params: DeployParam[]): any[] {
  const result: any[] = []
  _params.forEach((param) => {
    const { type, value } = param
    const transform = ABI_PARAMETER_INPUT_MAP[type].transform
    result.push(transform ? transform(value) : value)
  })

  return result
}

// 校验 Deploy Params
function genConstructorParamsData(_params: DeployParam[]) {
  if (_params.length === 0) {
    return
  }

  const target = transform_deploy_params(_params)
  const params = _params.map((item) => ({
    type: item.type,
  }))

  const abiParams = encodeAbiParameters(params, target)
  return abiParams
}

/**
 * 生成合约字节码
 * @param _contractByteCode 合约字节码
 * @param _params 构造函数参数
 * @returns
 */
export function genContractByteCodeWithConstructorParams(
  _baseContractByteCode: `0x${string}`,
  _params: DeployParam[],
): `0x${string}` {
  const constructorParamsData = genConstructorParamsData(_params)
  // 如果没有构造函数参数，直接返回合约字节码
  if (!constructorParamsData) {
    return _baseContractByteCode
  }
  const bytecode = _baseContractByteCode + constructorParamsData.slice(2)
  return bytecode as `0x${string}`
}

/**
 * 解析 Deploy 事件
 * @param receipt 交易回执
 */
type DeployEventArgs = {
  deployedAddress: string
  salt: bigint
}
export function parseDeployReceipt(receipt: any): DeployEventArgs | null {
  if (!receipt?.logs?.length) {
    throw new Error("receipt is empty")
  }

  // console.log(receipt)

  try {
    // 解析 Deploy 事件
    const deployLog = decodeEventLog({
      abi: luckyFactoryAbi,
      data: receipt.logs[0].data,
      topics: receipt.logs[0].topics,
      eventName: "Deploy",
    })

    if (typeof deployLog.args === "undefined") {
      throw new Error("incorrect data")
    }

    // 先转换为 unknown 类型，再断言为 DeployEventArgs 类型
    const info = deployLog.args as unknown as DeployEventArgs

    return {
      deployedAddress: info.deployedAddress,
      salt: info.salt,
    }
  } catch (error) {
    console.error("parse receipt failed:", error)
    throw new Error("parse receipt failed")
  }
}
