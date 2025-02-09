import solParser from "@solidity-parser/parser"

/**
 *
 * @description validate solidity code
 * @param {string} code solidity code
 * @returns
 */
export function validateSolidityCode(code: string): boolean {
  try {
    solParser.parse(code, { tolerant: false })
    return true
  } catch (e: any) {
    return false
  }
}
