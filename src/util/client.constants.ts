import { mainnet, sepolia, anvil } from "wagmi/chains"

import { IChainWithBuildAddress } from "@/types"

export const ALLOW_CHAINS_WITH_BUILD_CONTRACT: IChainWithBuildAddress[] = [
  {
    name: "mainnet",
    id: mainnet.id,
    factoryAddress:
      process.env.NEXT_PUBLIC_MAIN_FACTORY_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
  },
  {
    name: "sepolia",
    id: sepolia.id,
    factoryAddress:
      process.env.NEXT_PUBLIC_SEPOLIA_FACTORY_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
  },
  // test
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
    ? [
        {
          name: "local",
          id: anvil.id,
          factoryAddress:
            process.env.NEXT_PUBLIC_ANVIL_FACTORY_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
        },
      ]
    : []),
]
