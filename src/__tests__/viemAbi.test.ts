import {
  decodeAbiParameters,
  encodeAbiParameters,
  //   parseAbiParameters,
  //   encodePacked,
} from "viem"

describe("Viem ABI Tests", () => {
  test("decodeAbiParameters and encodeAbiParameters demo", () => {
    const encodedData = encodeAbiParameters(
      [
        { name: "x", type: "string" },
        { name: "y", type: "uint" },
        { name: "z", type: "bool" },
      ],
      ["wagmi", BigInt(42), true],
    )

    const decodeData = decodeAbiParameters(
      [
        { name: "x1", type: "string" },
        { name: "y1", type: "uint" },
        { name: "z2", type: "bool" },
      ],
      encodedData,
    )

    const expected = ["wagmi", BigInt(42), true]

    // 验证结果
    expect(decodeData).toEqual(expected)
  })

  test("encodeAbiParameters miss name", () => {
    const expected: any = ["wagmi", BigInt(42), true]
    const demo = encodeAbiParameters(
      [{ type: "string" }, { type: "uint" }, { type: "bool" }],
      expected,
    )
    const actual = decodeAbiParameters(
      [{ type: "string" }, { type: "uint" }, { type: "bool" }],
      demo,
    )

    // 验证结果
    expect(actual).toEqual(expected)
  })

  test("encodeAbiParameters with error", () => {
    // 测试错误情况下的 encodeAbiParameters
    expect(() => {
      encodeAbiParameters(
        [
          { name: "x", type: "string" },
          { name: "y", type: "uint" },
          { name: "z", type: "bool" },
        ],
        ["wagmi", "42", "true"] as any, // 故意传入错误类型的参数
      )
    }).toThrow(
      'Invalid boolean value: "true" (type: string). Expected: `true` or `false`',
    ) // 期望抛出异常
  })

  //   test("encodeAbiParameters and  encodePacked different", () => {
  //     // 构造函数
  //     const encodedData = encodeAbiParameters(
  //       [
  //         { name: "x", type: "string" },
  //         { name: "y", type: "uint" },
  //         { name: "z", type: "bool" },
  //       ],
  //       ["wagmi", BigInt(42), true],
  //     )
  //     const packedData = encodePacked(
  //       ["string", "uint", "bool"],
  //       ["wagmi", BigInt(42), true],
  //     )
  //     // 验证结果
  //     expect(encodedData).toEqual(packedData)
  //   })
})
