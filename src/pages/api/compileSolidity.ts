import { NextApiRequest, NextApiResponse } from "next"
import { compile } from "@/core/server.compile.solidity"
import { validateSolidityCode } from "@/util/solidity"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持 POST 请求" })
  }

  try {
    const {
      code,
      version = "0.8.28",
      evmVersion = "cancun",
      optimizer = false,
    } = req.body

    if (!code) {
      return res.status(400).json({ error: "缺少 Solidity 代码" })
    }

    // 验证 Solidity 代码格式
    if (!validateSolidityCode(code)) {
      return res.status(400).json({ error: "无效的 Solidity 代码格式" })
    }

    // 编译代码
    const { bytecode, abi } = compile(
      code,
      "Contract.sol",
      version,
      evmVersion,
      optimizer,
    )

    return res.status(200).json({
      bytecode: `0x${bytecode}`,
      abi,
    })
  } catch (error: any) {
    console.error("编译错误:", error)
    return res.status(500).json({ error: error.message })
  }
}
