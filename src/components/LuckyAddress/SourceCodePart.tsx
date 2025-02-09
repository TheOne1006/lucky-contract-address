import { useTranslation } from "next-i18next"
import {
  ALLOW_CODE_TYPES,
  ALLOW_FORK_ENVS,
  ALLOW_SOLC_VERSIONS,
} from "@/util/constants"
import { MonacoEditor } from "@/components/Editor"
import { shorForSolcVersion } from "@/util/compiler"

import { Button } from "@/components/ui/Button"

import { CODE_TYPE } from "@/util/constants"

type SourceCodeHeaderProps = {
  isComputing: boolean

  codeType: CODE_TYPE
  onCodeTypeChange: (type: CODE_TYPE) => void

  forkEnv: string | undefined
  onForkEnvChange: (option: string) => void

  solcVersion: string | undefined
  onSolcVersionChange: (option: string) => void

  code: string | undefined
  onCodeChange: (code: string, type: CODE_TYPE) => void
  goNext: () => void

  optimize: boolean
  onOptimizeChange: (optimize: boolean) => void
  compiling: boolean
  isValidSolidityCode: boolean | undefined
}

const allowSolcVersion = ALLOW_SOLC_VERSIONS.map((val) => {
  return {
    value: val,
    label: shorForSolcVersion(val),
  }
})

const SourceCodePart = ({
  isComputing = false,
  forkEnv,
  codeType,
  solcVersion,
  onForkEnvChange,
  onSolcVersionChange,
  onCodeTypeChange,
  code,
  goNext,
  onCodeChange,
  optimize,
  onOptimizeChange,
  compiling = false,
  isValidSolidityCode = false,
}: SourceCodeHeaderProps) => {
  const { t } = useTranslation("common")
  return (
    <>
      <div className="flex h-14 items-center border-b border-gray-200 pl-6 pr-2 dark:border-black-500 md:border-r">
        <div className="flex w-full items-center justify-between">
          <h3 className="text-md items-center font-semibold xl:inline-flex">
            <span>Code</span>
          </h3>

          <div className="flex w-full items-center justify-end">
            <select
              disabled={isComputing}
              value={codeType}
              onChange={(e) => onCodeTypeChange(e.target.value as CODE_TYPE)}
              className="bg-transparent px-3 py-2 sm:text-sm"
            >
              {ALLOW_CODE_TYPES.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* footer */}
      <div>
        <div
          className="pane pane-light relative overflow-auto border-gray-200 bg-gray-50 dark:border-black-500 dark:bg-black-600 md:border-r"
          style={{ height: 450 }}
        >
          <MonacoEditor
            onCodeChange={(code) => {
              onCodeChange(code, codeType)
            }}
            readonly={isComputing}
            lang={codeType}
            code={code}
          />
        </div>
        <div className="flex flex-col justify-end border-gray-200 px-2 dark:border-black-500 md:flex-row md:border-r md:py-2">
          <div className="flex w-full flex-wrap items-center justify-end space-x-3 px-0.5 py-1">
            {codeType === "solidity" && (
              <div className="flex flex-wrap items-center">
                <div className="flex flex-wrap items-center space-x-2">
                  <label className="text-sm">Optimization:</label>
                  <input
                    type="checkbox"
                    checked={optimize}
                    disabled={isComputing}
                    onChange={(e) => onOptimizeChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>

                <select
                  value={forkEnv}
                  disabled={isComputing}
                  onChange={(e) => onForkEnvChange(e.target.value)}
                  className="bg-transparent px-2 py-2 sm:text-sm"
                >
                  {ALLOW_FORK_ENVS.map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>

                <select
                  disabled={isComputing}
                  value={solcVersion}
                  onChange={(e) => onSolcVersionChange(e.target.value)}
                  className="bg-transparent px-2 py-2 sm:text-sm"
                >
                  {allowSolcVersion.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button
              onClick={goNext}
              /**
               * disabled when
               * 1. code is empty
               * 2. compiling
               * 3. codeType is solidity and isValidSolidityCode is false
               *
               */
              disabled={
                !code ||
                compiling ||
                (codeType === "solidity" && !isValidSolidityCode) ||
                isComputing
              }
              size="sm"
              contentClassName="justify-center"
            >
              {codeType !== "solidity"
                ? t("action.NextStep")
                : compiling
                  ? t("action.Compileing")
                  : t("action.Compile")}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SourceCodePart
