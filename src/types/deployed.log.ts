export type DeployedLogItem = {
  address: `0x${string}`
  salt: bigint
  txHash: `0x${string}`
  sender: `0x${string}`
  chainId: number
  factoryAddress: `0x${string}`
}
