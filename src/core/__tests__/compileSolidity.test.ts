import { compile } from "../compileSolidity"

const counterSol = `// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}`

describe("compile", () => {
  it("should successfully compile valid Solidity code", () => {
    // Mock successful compilation output
    const sourceCode = counterSol

    const result = compile(sourceCode, "contracts/Counter.sol")

    const expectedByteCode =
      "0x6080604052348015600e575f5ffd5b5060ec8061001b5f395ff3fe6080604052348015600e575f5ffd5b5060043610603a575f3560e01c80633fb5c1cb14603e5780638381f58a14604f578063d09de08a146068575b5f5ffd5b604d6049366004607d565b5f55565b005b60565f5481565b60405190815260200160405180910390f35b604d5f805490806076836093565b9190505550565b5f60208284031215608c575f5ffd5b5035919050565b5f6001820160af57634e487b7160e01b5f52601160045260245ffd5b506001019056fea26469706673582212206c0950974244f7bebfc82df4b98d4d3221a90459b789270910d38b546666bc8464736f6c634300081c0033"

    // expect(result.length).toBe(expectedByteCode.length)
    // 比较字节码是否相等
    expect(result).toBe(expectedByteCode)
  })

  //   it("should handle compilation errors", () => {
  //     // Mock compilation output with errors
  //     const mockOutput = {
  //       errors: [
  //         {
  //           severity: "error",
  //           message: "Compilation error: Invalid syntax",
  //         },
  //       ],
  //     }

  //     // @ts-ignore
  //     solc.compile.mockReturnValue(JSON.stringify(mockOutput))

  //     const sourceCode = "invalid solidity code"
  //     const fileName = "Test.sol"

  //     const result = compile(sourceCode, fileName)

  //     expect(result.success).toBe(false)
  //     expect(result.error).toBe("Compilation error: Invalid syntax")
  //     expect(result.output).toBeUndefined()
  //     expect(solc.compile).toHaveBeenCalledTimes(1)
  //   })

  //   it("should handle warnings without failing compilation", () => {
  //     // Mock compilation output with warnings
  //     const mockOutput = {
  //       errors: [
  //         {
  //           severity: "warning",
  //           message: "Unused variable",
  //         },
  //       ],
  //       contracts: {
  //         "Test.sol": {
  //           TestContract: {
  //             abi: [],
  //             evm: { bytecode: { object: "0x123" } },
  //           },
  //         },
  //       },
  //     }

  //     // @ts-ignore
  //     solc.compile.mockReturnValue(JSON.stringify(mockOutput))

  //     const sourceCode = "contract TestContract { uint unused; }"
  //     const fileName = "Test.sol"

  //     const result = compile(sourceCode, fileName)

  //     expect(result.success).toBe(true)
  //     expect(result.output).toEqual(mockOutput)
  //     expect(result.error).toBeUndefined()
  //     expect(solc.compile).toHaveBeenCalledTimes(1)
  //   })

  //   it("should verify compiler input format", () => {
  //     // Mock successful compilation
  //     const mockOutput = {
  //       contracts: {
  //         "Test.sol": {
  //           TestContract: {
  //             abi: [],
  //             evm: { bytecode: { object: "0x123" } },
  //           },
  //         },
  //       },
  //     }

  //     // @ts-ignore
  //     solc.compile.mockImplementation((input) => {
  //       const parsedInput = JSON.parse(input)
  //       expect(parsedInput.language).toBe("Solidity")
  //       expect(parsedInput.sources["Test.sol"].content).toBe(
  //         "contract TestContract { }",
  //       )
  //       expect(parsedInput.settings.outputSelection["*"]["*"]).toEqual(["*"])
  //       return JSON.stringify(mockOutput)
  //     })

  //     const sourceCode = "contract TestContract { }"
  //     const fileName = "Test.sol"

  //     compile(sourceCode, fileName)

  //     expect(solc.compile).toHaveBeenCalledTimes(1)
  //   })
})
