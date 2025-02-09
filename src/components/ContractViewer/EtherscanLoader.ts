import { EtherscanContractResponse } from "@/types/contract"

import { etherscanParse } from "@/util/EtherscanParser"

import { DeploymentInfo } from "./DeploymentInfo"

export default class EtherscanLoader {
  static async loadFromEtherscan(address: string) {
    const data = await fetch("/api/getContract?address=" + address)
      .then((res) => res.json())
      .catch((err) => {
        console.error("fetch error:", err)
        throw err
      })

    return etherscanParse(data)
  }

  static async loadDeployment(address: string, context?: DeploymentInfo) {
    address = address.toLowerCase()

    const etherscanInfo = await EtherscanLoader.loadFromEtherscan(address)

    console.log("etherscanInfo", etherscanInfo)

    if (
      !etherscanInfo?.SourceCode ||
      etherscanInfo?.ABI == "Contract source code not verified"
    ) {
      throw "failed to load contract info"
    }

    console.log("etherscanInfo", etherscanInfo)

    return new DeploymentInfo(etherscanInfo, address, context)
  }
}
