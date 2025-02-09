// 定义通用的 Solc 接口类型
interface SolcInterface {
  compile(input: string): string
  loadRemoteVersion(
    version: string,
    callback: (err: Error | null, solc?: any) => void,
  ): void
  version(): string
}

// 为不同的模块声明相同的接口
declare module "solc" {
  const solc: SolcInterface
  export = solc
}

declare module "solc-0.8.28" {
  const solc: SolcInterface
  export = solc
}

declare module "solc-0.8.27" {
  const solc: SolcInterface
  export = solc
}

declare module "solc-0.8.26" {
  const solc: SolcInterface
  export = solc
}
