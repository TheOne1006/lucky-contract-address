export const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || ""

export enum CODE_TYPE {
  SOLIDITY = "solidity",
  BYTECODE = "bytecode",
}

export const ALLOW_CODE_TYPES = [CODE_TYPE.SOLIDITY, CODE_TYPE.BYTECODE]
export const ALLOW_FORK_ENVS = ["cancun", "shanghai"]
export const ALLOW_SOLC_VERSIONS = [
  "v0.8.28+commit.7893614a",
  "v0.8.27+commit.40a35a09",
  "v0.8.26+commit.8a97fa7a",
]

export const ALLOW_CONSTRUCTOR_PARAMS_TYPES = [
  "uint256",
  "address",
  "bytes",
  "string",
  "bool",
  "int256",
  "uint256[]",
  "int256[]",
  "address[]",
  "bytes[]",
  "string[]",
  "bool[]",
]

// max salt for create2, max is 2^256 - 1
export const MAX_SALT = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
)

// max size for search, MAX_SALT / f, max woker is 16
// export const MAX_SEARCH_SIZE = BigInt(
//   "0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
// )

export const MAX_WORKERS = 16

export const CACHE_PREFIX = "LCA:"
export const PROJECT_LIST_KEY = "PROJECTS"
export const PROJECT_PREFIX = "PROJECT:"
export const WORKERS_PREFIX = "WORKERS:"

/**
 * allow value unit
 */
export enum ValueUnit {
  Wei = "Wei",
  Gwei = "Gwei",
  Finney = "Finney",
  Ether = "Ether",
}

export enum Decimals {
  Wei = 0,
  Gwei = 9,
  Finney = 15,
  Ether = 18,
}
