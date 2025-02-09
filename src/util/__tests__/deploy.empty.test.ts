jest.mock("@/util/constants", () => ({
  ALLOW_CHAINS_WITH_BUILD_CONTRACT: [],
}))
import { getFactoryAddr } from "../deploy"

describe("getFactoryAddr with empty chains", () => {
  it("应该在链列表为空时抛出错误", () => {
    expect(() => {
      getFactoryAddr(1) // 使用任意 chainId
    }).toThrow("not found factory address")
  })
})
