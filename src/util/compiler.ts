import { BN } from "ethereumjs-util"
// Version here: https://github.com/ethereum/solc-bin/blob/gh-pages/bin/list.txt
function toHexString(number: string, byteSize: number): string {
  let parsedNumber = null

  if (number.startsWith("0x") || number.startsWith("0X")) {
    if (!/^(0x|0X)[0-9a-fA-F]+$/.test(number)) {
      throw new Error("Not a valid hexadecimal number: " + number)
    }

    parsedNumber = new BN(number.substring(2), "hex")
  } else {
    if (!/^[0-9]+$/.test(number)) {
      throw new Error("Not a valid decimal number: " + number)
    }

    parsedNumber = new BN(number)
  }

  if (parsedNumber.byteLength() > byteSize) {
    throw new Error("Value is too big for " + byteSize + " byte(s): " + number)
  }

  return parsedNumber.toString("hex", byteSize * 2)
}

export function shorForSolcVersion(fullVersion: string): string {
  const parts = fullVersion.split("+")
  if (parts.length !== 2) {
    throw new Error("Invalid version format")
  }
  return parts[0]
}
