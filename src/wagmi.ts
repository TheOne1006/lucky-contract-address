import { http, createConfig } from "wagmi"
import { mainnet, sepolia, anvil } from "wagmi/chains"

export const config = createConfig({
  chains: [
    mainnet,
    sepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [anvil] : []),
  ],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [anvil.id]: http(),
  },
})
