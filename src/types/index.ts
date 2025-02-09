export * from "./lucky"
export interface IChain {
  id: number
  name: string
}

export interface IChainWithBuildAddress extends IChain {
  factoryAddress: string
}
