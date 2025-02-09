import { NextApiResponse, NextApiRequest } from "next"

import { etherscanGetSource } from "../../util/EtherscanApi"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.status(405)
  }

  const addr = req.query?.address as string
  const data = await etherscanGetSource(addr)
  res.status(200).json(data)
}
