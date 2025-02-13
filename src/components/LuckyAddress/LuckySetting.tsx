import clsx from "clsx"
import { useTranslation } from "next-i18next"
import { Slider } from "@mui/material"
import { Button, Icon } from "@/components/ui"
import { MonacoEditor } from "@/components/Editor"
import AbiParameterInput from "./AbiParameterInput"
import { ALLOW_CONSTRUCTOR_PARAMS_TYPES } from "@/util/constants"
import { ABI_PARAMETER_INPUT_MAP } from "@/util/abi"
import { MAX_WORKERS } from "@/util/common.constants"
import type { DeployParam } from "@/types/lucky"

type LuckySettingProps = {
  isComputing?: boolean
  curProjectTitle?: string
  bytecode?: `0x${string}`
  luckyNumberText?: string
  onLuckyNumberTextChange: (texts: string) => void
  allowDynamicConstructorParams?: boolean
  constructorParams?: DeployParam[]
  factoryAddress: `0x${string}`
  workerProcess: [number, number]
  onWorkerProcessChange: (newProcess: [number, number]) => void
  onConstructorParamsChange: (param: DeployParam, ind: number) => void
  onConstructorParamsAppend: (param: DeployParam) => void
  onConstructorParamsDelect: (id: number) => void
  refreshFactoryAddress: () => void
  submit: (
    title: string,
    byteCode: `0x${string}`,
    params: DeployParam[],
    txt: string,
  ) => void
  stopSearch: () => void
}
export default function LuckySetting({
  isComputing = false,
  curProjectTitle,
  bytecode,
  luckyNumberText = "",
  allowDynamicConstructorParams = false,
  constructorParams,
  factoryAddress,
  workerProcess,
  onWorkerProcessChange,
  onLuckyNumberTextChange,
  onConstructorParamsChange,
  onConstructorParamsAppend,
  onConstructorParamsDelect,
  refreshFactoryAddress,
  submit,
  stopSearch,
}: LuckySettingProps) {
  const { t } = useTranslation("common")
  return (
    <form>
      <div className="space-y-2 px-2" style={{ minHeight: 435 }}>
        <div className="border-gray-900/10">
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="bytecode" className="block text-sm/6">
                {t("label.BytecodePreview")}
              </label>
              <div className="mt-2">
                <textarea
                  id="bytecode"
                  name="bytecode"
                  rows={2}
                  readOnly
                  className="block w-full rounded-md px-3 py-1.5 outline outline-1 outline-gray-300 dark:outline-gray-600 sm:text-sm/6"
                  value={bytecode}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={clsx("col-span-full", {
            hidden:
              constructorParams?.length == 0 && !allowDynamicConstructorParams,
          })}
        >
          <div className="flex items-center justify-between">
            <label htmlFor="Params" className="block text-sm/6">
              {t("label.DeployParams")}
            </label>
            <div
              className={clsx("text-sm", {
                hidden: !allowDynamicConstructorParams,
              })}
            >
              <button
                type="button"
                // 隐藏按钮
                className="inline-block rounded bg-green-500 px-4 py-2 text-tiny font-medium text-white outline-none hover:bg-green-600 active:opacity-50"
                disabled={isComputing}
                onClick={() => {
                  const newId = Math.ceil(Math.random() * 100000)
                  onConstructorParamsAppend({
                    // 随机生成一个id int, 取整
                    id: newId,
                    type: ALLOW_CONSTRUCTOR_PARAMS_TYPES[0],
                    value: "",
                  })
                }}
              >
                <div className="flex items-center justify-center">
                  <Icon
                    name="add-line"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                  />
                </div>
              </button>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            {constructorParams?.map((param) => (
              <div
                // id={`${param.type}-${ind}`}
                key={`${param.id}`}
                className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 dark:bg-black-700 dark:outline-gray-600"
              >
                <div className="grid shrink-0 grid-cols-1">
                  <select
                    disabled={!allowDynamicConstructorParams || isComputing}
                    value={param.type}
                    className={clsx(
                      "col-start-1 row-start-1 w-full rounded-md py-1 pl-3 pr-1 text-base text-gray-500 outline-none placeholder:text-gray-400 dark:text-gray-400 sm:text-sm/6",
                      {
                        "appearance-none": !allowDynamicConstructorParams,
                      },
                    )}
                    // className="col-start-1 row-start-1 w-full appearance-none rounded-md py-1.5 pl-3 pr-7 text-base text-gray-500 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    onChange={(e) => {
                      onConstructorParamsChange(
                        {
                          id: param.id,
                          type: e.target.value,
                          value: param.value,
                        },
                        param.id,
                      )
                    }}
                  >
                    {ALLOW_CONSTRUCTOR_PARAMS_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <AbiParameterInput
                  key={param.id}
                  disabled={isComputing}
                  config={ABI_PARAMETER_INPUT_MAP[param.type]}
                  className="block min-w-0 grow py-1.5 pl-1 text-base outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-0 dark:outline-gray-600 sm:text-sm/6"
                  value={param.value}
                  onChange={(e) => {
                    onConstructorParamsChange(
                      {
                        id: param.id,
                        type: param.type,
                        value: e.target.value,
                      },
                      param.id,
                    )
                  }}
                />
                <div
                  className={clsx(
                    "grid shrink-0 grid-cols-1 focus-within:relative",
                    {
                      hidden: !allowDynamicConstructorParams,
                    },
                  )}
                >
                  <button
                    type="button"
                    disabled={isComputing}
                    className="inline-block rounded bg-red-500 px-4 py-2 text-tiny font-medium text-white outline-none hover:bg-red-600 active:opacity-50"
                    onClick={() => {
                      onConstructorParamsDelect(param.id)
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <Icon
                        name="subtract-line"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                      />
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="lucky-number" className="block text-sm/6">
            {t("label.LuckyNumber")}
          </label>
          <div className="mt-2">
            <div
              className="pane pane--rounded pane--with-shadow"
              style={{ height: 100 }}
            >
              <MonacoEditor
                onCodeChange={(code) => {
                  onLuckyNumberTextChange(code)
                }}
                readonly={isComputing}
                enableValidation={false}
                lang="javascript"
                code={luckyNumberText}
              />
            </div>
          </div>
          <p className="px-1 py-3 text-sm/6">
            {t("tip.LuckyNumber")} <br />
            For example:{" "}
            <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-sm text-red-400">
              888888888
            </code>{" "}
            or{" "}
            <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-sm text-red-400">
              /^0x[0-9a-f]{4}$/
            </code>
          </p>
        </div>

        <div className="col-span-full">
          <label className="block text-sm/6">{t("label.ProcessCount")}</label>
          <div className="px-6">
            <div className="pane pane--rounded pane--with-shadow">
              <Slider
                // getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                onChange={(e, newValue) => {
                  if (Array.isArray(newValue) && newValue.length == 2) {
                    // 排序
                    const sortValue = newValue.sort((a, b) => a - b)
                    onWorkerProcessChange([...sortValue] as [number, number])
                  }
                }}
                step={1}
                marks
                value={workerProcess}
                min={1}
                max={MAX_WORKERS}
                // value={value2}
                // onChange={handleChange2}
                // valueLabelDisplay="auto"
                disableSwap
              />
            </div>
          </div>
        </div>

        <div className="border-gray-900/10">
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-6">
            <div
              className="col-span-full"
              onClick={() => {
                refreshFactoryAddress()
              }}
            >
              <label className="block text-sm/6">
                {t("label.FactoryAddress")}
                {/* todo: 添加 刷新按钮 */}
              </label>
              <div className="mt-2 px-2 text-sm">{factoryAddress}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-end border-gray-200 px-2 dark:border-black-500 md:flex-row md:border-r md:py-2">
        <div className="flex w-full flex-wrap items-center justify-end gap-4 space-x-4 py-1">
          {isComputing && (
            <Button
              type="button"
              onClick={() => {
                stopSearch()
              }}
              size="sm"
              className="bg-red-500 hover:bg-red-600 active:bg-red-700"
              contentClassName="justify-center"
            >
              {t("action.Stop")}
            </Button>
          )}

          <Button
            type="button"
            onClick={() => {
              if (bytecode && curProjectTitle) {
                submit(
                  curProjectTitle,
                  bytecode,
                  constructorParams || [],
                  luckyNumberText,
                )
              }
            }}
            disabled={
              !bytecode ||
              // 构造参数 value 存在空
              (constructorParams || []).some((item) => !item.value) ||
              !luckyNumberText ||
              !curProjectTitle || // 当前项目名为空
              isComputing
            }
            size="sm"
            contentClassName="justify-center"
          >
            {t("action.Check")}
          </Button>
        </div>
      </div>
    </form>
  )
}
