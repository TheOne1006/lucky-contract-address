import { keccak256 } from "viem"

jest.mock("@/util/constants", () => ({
  ALLOW_CHAINS_WITH_BUILD_CONTRACT: [],
}))

import {
  computAddressWithCreate2,
  computAddressWithCreate2EthereumjsUtil,
  computAddressWithCreate2EthereumjsUtilAndByteCodeHash,
} from "../deploy"

describe("deploy", () => {
  const mockFactoryAddress =
    "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as `0x${string}`
  const mockBytecode =
    "0x6080604052348015600e575f5ffd5b506101e18061001c5f395ff3fe608060405234801561000f575f5ffd5b506004361061003f575f3560e01c80633fb5c1cb146100435780638381f58a1461005f578063d09de08a1461007d575b5f5ffd5b61005d600480360381019061005891906100e4565b610087565b005b610067610090565b604051610074919061011e565b60405180910390f35b610085610095565b005b805f8190555050565b5f5481565b5f5f8154809291906100a690610164565b9190505550565b5f5ffd5b5f819050919050565b6100c3816100b1565b81146100cd575f5ffd5b50565b5f813590506100de816100ba565b92915050565b5f602082840312156100f9576100f86100ad565b5b5f610106848285016100d0565b91505092915050565b610118816100b1565b82525050565b5f6020820190506101315f83018461010f565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61016e826100b1565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036101a05761019f610137565b5b60018201905091905056fea2646970667358221220f557ab7ec559c0f83ac3d8dcb4062ab1319f041d5ada04f8dde4be040b36a37864736f6c634300081c0033" as `0x${string}`

  it("应该正确计算合约地址", () => {
    const salt = BigInt(12)
    const expectedAddress = "0x9B147D70D6bF720AC292E8ad862ad65E60769013"

    const result = computAddressWithCreate2(
      mockFactoryAddress,
      salt,
      mockBytecode,
    )
    expect(result.toLowerCase()).toBe(expectedAddress.toLowerCase())
  })

  it("keccak256 too bytecode hash", () => {
    const result = keccak256(mockBytecode)
    const expected =
      "0x799813918fa0bdf07c97809b9d0d698d2c93356913a2c736747e65cb17f52045"

    expect(result.toLowerCase()).toBe(expected.toLowerCase())
  })

  it("computAddressWithCreate2EthereumjsUtil 应该正确计算合约地址", () => {
    const salt = BigInt("0x221abcedf0012123122123445")
    const actual = computAddressWithCreate2EthereumjsUtil(
      mockFactoryAddress,
      salt,
      mockBytecode,
    )

    const expected = computAddressWithCreate2(
      mockFactoryAddress,
      salt,
      mockBytecode,
    )

    expect(actual.toLowerCase()).toBe(expected.toLowerCase())
  })

  it("使用不同的 salt 值应该生成不同的地址", () => {
    const salt1 = BigInt(1)
    const salt2 = BigInt(2)

    const address1 = computAddressWithCreate2(
      mockFactoryAddress,
      salt1,
      mockBytecode,
    )
    const address2 = computAddressWithCreate2(
      mockFactoryAddress,
      salt2,
      mockBytecode,
    )

    expect(address1).not.toBe(address2)
  })

  it("使用相同的参数应该生成相同的地址", () => {
    const salt = BigInt(1)

    const address1 = computAddressWithCreate2(
      mockFactoryAddress,
      salt,
      mockBytecode,
    )
    const address2 = computAddressWithCreate2(
      mockFactoryAddress,
      salt,
      mockBytecode,
    )

    expect(address1).toBe(address2)
  })

  it("生成的地址应该是有效的以太坊地址格式", () => {
    const salt = BigInt(1)
    const result = computAddressWithCreate2(
      mockFactoryAddress,
      salt,
      mockBytecode,
    )

    expect(result).toMatch(/^0x[0-9a-fA-F]{40}$/)
  })

  it("使用大数值的 salt 应该正常工作", () => {
    const salt = BigInt(
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    )
    // 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff，
    const result = computAddressWithCreate2(
      mockFactoryAddress,
      salt,
      mockBytecode,
    )

    expect(result).toMatch(/^0x[0-9a-fA-F]{40}$/)
  })

  describe("computAddressWithCreate2EthereumjsUtilAndByteCodeHash", () => {
    it("salt 12", () => {
      const factory_address = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
      let salt = BigInt(12) // == 0x000000000000000000000000000000000000000000000000000000000000000c
      let bytecode_hash =
        "0x799813918fa0bdf07c97809b9d0d698d2c93356913a2c736747e65cb17f52045" as `0x${string}`

      // 计算 create2 地址
      const actual = computAddressWithCreate2EthereumjsUtilAndByteCodeHash(
        factory_address,
        salt,
        bytecode_hash,
      )
      let expected = "0x9B147D70D6bF720AC292E8ad862ad65E60769013"
      expect(actual.toLocaleLowerCase()).toBe(expected.toLocaleLowerCase())
    })

    it("salt 13", () => {
      const factory_address = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
      let salt = BigInt(13) // == 0x000000000000000000000000000000000000000000000000000000000000000d
      let bytecode_hash =
        "0x799813918fa0bdf07c97809b9d0d698d2c93356913a2c736747e65cb17f52045" as `0x${string}`

      // 计算 create2 地址
      const actual = computAddressWithCreate2EthereumjsUtilAndByteCodeHash(
        factory_address,
        salt,
        bytecode_hash,
      )
      let expected = "0xf82327cb2bc0e53db44fff445f9572b41640285c"
      expect(actual.toLocaleLowerCase()).toBe(expected.toLocaleLowerCase())
    })
  })
})
