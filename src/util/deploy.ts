import { keccak256 as ethereumjsKeccak256 } from "ethereum-cryptography/keccak"
import { encodePacked, keccak256 } from "viem"
// 基于 abi 合约信息, 传入 合约的 bytecode 和 salt
import { ALLOW_CHAINS_WITH_BUILD_CONTRACT } from "@/util/constants"

export function getFactoryAddr(chainId: number): string {
  const chain = ALLOW_CHAINS_WITH_BUILD_CONTRACT.find(
    (item) => item.id === chainId && item.factoryAddress,
  )

  if (!chain?.factoryAddress) {
    throw new Error("not found factory address")
  }

  return chain.factoryAddress
}

export function formatLuckyNumberText(text: string): string[] {
  const hexReg = /^(0x)?[0-9a-fA-F]+$/
  const regexReg = /^\/.*\/$/

  // 分割文本为行
  const lines = text.split("\n").filter((line) => line.trim())

  const matchList: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // 检查是否为16进制格式 (0x开头)
    // 检查是否为正则表达式格式 (以/开头和结尾)
    if (hexReg.test(trimmedLine) || regexReg.test(trimmedLine)) {
      matchList.push(trimmedLine)
    }
  }

  return matchList
}

/**
 *
 * address(uint160(uint(keccak256(abi.encodePacked(
 *     bytes1(0xff),
 *     address(this),
 *     bytes32(_salt),
 *     keccak256(bytecode)
 * )))))
 * 使用 create2 计算合约地址
 * @param factoryAddress 工厂合约地址
 * @param salt 用于生成地址的盐值
 * @param bytecode 合约字节码
 * @returns 计算得到的合约地址
 */
export function computAddressWithCreate2(
  factoryAddress: `0x${string}`,
  salt: bigint,
  bytecode: `0x${string}`,
): `0x${string}` {
  const bytecodeHash = keccak256(bytecode)

  const encodedData = encodePacked(
    ["bytes1", "address", "bytes32", "bytes32"],
    [
      "0xff",
      factoryAddress,
      `0x${salt.toString(16).padStart(64, "0")}`,
      bytecodeHash,
    ],
  )

  const addressBytes = keccak256(encodedData)
  // 取后 20 字节（160 位）作为地址，与 Solidity 中的 uint160 转换一致
  return `0x${addressBytes.slice(26)}` as `0x${string}`
}

// 使用 ethereumjs-util 库计算合约地址
export function computAddressWithCreate2EthereumjsUtil(
  factoryAddress: `0x${string}`,
  salt: bigint,
  bytecode: `0x${string}`,
): `0x${string}` {
  // 计算合约字节码的 keccak256 哈希
  const bytecodeHash = ethereumjsKeccak256(
    Buffer.from(bytecode.slice(2), "hex"),
  )

  // 构建输入数据
  const input = Buffer.concat([
    Buffer.from("ff", "hex"),
    Buffer.from(factoryAddress.slice(2), "hex"),
    Buffer.from(salt.toString(16).padStart(64, "0"), "hex"),
    bytecodeHash,
  ])

  // 计算最终的 keccak256 哈希并转换为地址格式
  const addressBytes = ethereumjsKeccak256(input)

  return `0x${Buffer.from(addressBytes).subarray(-20).toString("hex")}` as `0x${string}`
}

export function computAddressWithCreate2EthereumjsUtilAndByteCodeHash(
  factoryAddress: `0x${string}`,
  salt: bigint,
  bytecodeHashStr: `0x${string}`,
): `0x${string}` {
  // 计算合约字节码的 keccak256 哈希
  const bytecodeHash = Buffer.from(bytecodeHashStr.slice(2), "hex")
  // 构建输入数据
  const input = Buffer.concat([
    Buffer.from("ff", "hex"),
    Buffer.from(factoryAddress.slice(2), "hex"),
    Buffer.from(salt.toString(16).padStart(64, "0"), "hex"),
    bytecodeHash,
  ])

  // 计算最终的 keccak256 哈希并转换为地址格式
  const addressBytes = ethereumjsKeccak256(input)

  return `0x${Buffer.from(addressBytes).subarray(-20).toString("hex")}` as `0x${string}`
}
