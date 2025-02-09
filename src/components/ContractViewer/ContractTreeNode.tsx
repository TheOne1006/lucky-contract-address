"use client"

import React, { useState } from "react"

import MuiTextField from "@mui/material/TextField"
import { TreeItem } from "@mui/x-tree-view/TreeItem"
import type { AbiFunction, AbiParameter } from "abitype"
import { useRouter } from "next/router"
import { ContractArtifact } from "@/types/ast"
import {
  // cs
  toFunctionSelector,
  // decodeFunctionResult,
  // encodeFunctionData,
  encodeAbiParameters,
  keccak256,
  encodePacked,
  decodeAbiParameters,
  Hex,
} from "viem"
// import { mainnet } from "viem/chains"

import { Button, Icon } from "@/components/ui"

import { DeploymentInfo, useDeployments } from "./DeploymentInfo"
import useGenericReducer, {
  convertShortpath,
  getReducerState,
} from "./GenericReducer"
import {
  rpc,
  getComponentArraySize,
  getArrayBaseComponent,
  getBadgeColor,
  // spaceBetween,
  // initStateFromAbiInputs,
  initStateFromComponent,
} from "./ViewerUtils"
import type { AbiComponent } from "./ViewerUtils"

const TextField = ({ ...props }) => {
  return (
    <MuiTextField
      autoComplete="off"
      className="w-full bg-gray-200 dark:invert"
      {...props}
    />
  )
}

const TreeItemLabel = ({ title, subtitle }: any) => {
  return (
    <div className="flex w-full justify-between">
      <span>{title}</span>
      {subtitle && (
        <span className="pt-1 text-xs">
          {subtitle.split(" ").map((str: string, i: number) => (
            <span
              key={i}
              className={
                "text-gray-700 " +
                getBadgeColor(str) +
                " mx-1 rounded-xl px-2 dark:invert"
              }
            >
              {str}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}

const TreeItemBasic = ({
  nodeId,
  title,
  subtitle,
  children,
  ...props
}: any) => {
  return (
    <TreeItem
      itemId={nodeId}
      label={<TreeItemLabel title={title} subtitle={subtitle} />}
      className="border-b border-l dark:border-gray-600"
      onClick={props.onSelect}
      {...props}
    >
      {children}
    </TreeItem>
  )
}

type FuncData = {
  params: any[]
  value: string
  outputs: any[]
}

type ArrayParamItemProps = {
  inputAbi: AbiComponent
  path: string
  reducer: any
}

const ArrayParamItem = ({ inputAbi, path, reducer }: ArrayParamItemProps) => {
  const [arrayData, updateArrayData] = reducer
  const arraySize = getComponentArraySize(inputAbi)

  const fields = getReducerState(arrayData, path, new Array(arraySize || 0))

  return (
    <>
      <span className="bg-white text-xs text-gray-500 dark:bg-black-900">
        array {inputAbi.internalType?.replace(/^struct /, "")} {inputAbi.name} (
        {arraySize !== undefined ? "fixed " : ""}
        {fields.length} items)
      </span>

      <div className="flex flex-col p-2">
        {fields.map((_: never, index: number) => {
          return (
            <div key={index}>
              <button
                style={{
                  position: "relative",
                  top: "12px",
                  left: "12px",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  borderRadius: "20px",
                  zIndex: 9999,
                }}
                className="bg-white"
                onClick={() => {
                  fields.splice(index, 1)
                  updateArrayData({ [path]: fields })
                }}
              >
                <Icon
                  size="sm"
                  name="close-large-line"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                />
              </button>
              <ParamItem
                path={`${path}.${index}`}
                inputAbi={getArrayBaseComponent(inputAbi)}
                reducer={reducer}
              />
            </div>
          )
        })}
        {arraySize === undefined && (
          <Button
            className="mt-4 border-2 border-solid"
            size="sm"
            transparent
            outline
            onClick={() => {
              const initVal = initStateFromComponent(
                getArrayBaseComponent(inputAbi),
              )
              fields.push(initVal)
              updateArrayData({ [path]: fields })
            }}
          >
            + {path}
          </Button>
        )}
      </div>
    </>
  )
}

type TupleParamItemProps = {
  inputAbi: AbiParameter & { components: AbiParameter[] }
  path: string
  reducer: any
}

const TupleParamItem = ({ inputAbi, path, reducer }: TupleParamItemProps) => {
  const typeName = inputAbi.internalType || "tuple"
  return (
    <div className="flex flex-col p-2">
      <span className="pb-2 text-xs text-gray-500">
        {typeName} {inputAbi.name}
      </span>

      {inputAbi.components.map((component: any, index: number) => {
        return (
          <ParamItem
            key={index}
            inputAbi={component}
            path={`${path}.${index}`}
            reducer={reducer}
          />
        )
      })}
    </div>
  )
}

type ParamItemProps = {
  path: string
  inputAbi: AbiComponent
  reducer: any
  output?: boolean
}

export const ParamItem = ({
  path,
  inputAbi,
  reducer,
  output,
}: ParamItemProps) => {
  // array
  if (inputAbi.type.endsWith("]")) {
    return (
      <div className="my-1 rounded-xl border-2 py-2 pl-2 hover:border-blue-500">
        <ArrayParamItem path={path} inputAbi={inputAbi} reducer={reducer} />
      </div>
    )
  }

  if (inputAbi.type == "tuple") {
    return (
      <div className="mr-2 rounded-xl border py-2 pl-2 hover:border-blue-500">
        <TupleParamItem path={path} inputAbi={inputAbi} reducer={reducer} />
      </div>
    )
  }

  const [paramData, updateParamData] = reducer
  const val = getReducerState(paramData, path, "")

  let error = false
  if (val.toString().length > 0) {
    try {
      encodeAbiParameters([inputAbi], [val])
    } catch (err: any) {
      error = true
    }
  }

  let props
  if (output) {
    props = {
      label: (inputAbi.internalType || inputAbi.type) + " " + inputAbi.name,
      value: val.toString(),
    }
  } else {
    props = {
      label: (inputAbi.internalType || inputAbi.type) + " " + inputAbi.name,
    }
  }

  return (
    <TextField
      size="small"
      readOnly={output}
      error={error}
      sx={{ marginTop: "4px", marginBottom: "4px", marginRight: "16px" }}
      onChange={(e: any) => {
        if (!output) {
          updateParamData({ [path]: e.target.value })
        }
      }}
      {...props}
    />
  )
}

type ParamsBoxProps = {
  abi: AbiFunction
  reducer: any
}

export const ParamsBox = ({ abi, reducer }: ParamsBoxProps) => {
  const [funcData, updateFuncData] = reducer

  return (
    <div className="flex flex-col gap-2 text-black-500">
      {abi.inputs?.map((inputAbi: any, i: number) => (
        <ParamItem
          key={i}
          inputAbi={inputAbi}
          path={i.toString()}
          // reducer={params}
          reducer={[
            funcData.params,
            (val: any) => updateFuncData({ params: convertShortpath(val) }),
          ]}
        />
      ))}
      {abi.stateMutability == "payable" && (
        <TextField
          variant="outlined"
          label="value (wei)"
          size="small"
          type="number"
          onChange={(e: any) => {
            updateFuncData({ value: e.target.value })
          }}
        />
      )}
    </div>
  )
}

type ReturnDataBox = {
  abi: AbiFunction
  reducer: any
}

export const ReturnDataBox = ({ abi, reducer }: ReturnDataBox) => {
  const [funcData] = reducer

  return (
    <div className="my-2 flex flex-col gap-2 text-black-500">
      <span className="text-xs dark:text-gray-200">result:</span>
      {abi.outputs?.map((inputAbi: any, i: number) => (
        <ParamItem
          key={i}
          inputAbi={inputAbi}
          path={i.toString()}
          reducer={[funcData.outputs, null]}
          output={true}
        />
      ))}
    </div>
  )
}

type FunctionAbiItemProps = {
  id: string
  address: string
  funcAbi: AbiFunction
}

type CallStatus =
  | {
      status: "error"
      message: string
    }
  | {
      status: "success"
      message: string
    }

export const FunctionAbiItem = ({
  id,
  address,
  funcAbi,
}: FunctionAbiItemProps) => {
  const funcName = funcAbi.name
  let subtitle = `${funcAbi.type}`
  if (funcAbi.stateMutability == "payable") {
    subtitle += " payable"
  }

  return (
    <TreeItemBasic
      itemId={`function_${id}_${funcAbi.name}`}
      title={funcName}
      subtitle={subtitle}
    >
      <div className="my-2 mr-4 flex flex-col gap-2 text-black-500">
        <p className="text-xs dark:text-gray-200">
          4byte selector: {toFunctionSelector(funcAbi)}
        </p>
      </div>
    </TreeItemBasic>
  )
}

interface StorageType {
  key: string
  encoding: string
  label: string
  numberOfBytes: string
  value: string
  members?: StorageType[]
  base?: string
}

type StorageLayoutItemProps = {
  id: string
  address: string
  storage: {
    astId: number
    label: string
    contract: string
    offset: number
    slot: any
    type: string
  }
  types: {
    [type: string]: StorageType
  }
}

// Return a list of all the mapping keys used by a type
function getKeyTypes({
  types,
  key,
}: {
  types: Record<string, StorageType>
  key: string
}) {
  const keyTypes: string[] = []
  let storageType = types[key]

  while (storageType.encoding === "mapping") {
    keyTypes.push(storageType.key)
    storageType = types[storageType.value]
  }

  return {
    keyTypes,
    storageType,
  }
}

export const StorageLayoutItem = ({
  id,
  address,
  storage,
  types,
}: StorageLayoutItemProps) => {
  const [status, setStatus] = useState("0x...")
  const [inputs, setInputs] = useState<string[]>([])

  const type = types[storage.type]

  // if storage item is a mapping, keyTypes is an array of types of all mapping keys
  // eg. keys of mapping(address => mapping(uint256 => bytes)) would be ['address', 'uint256']
  const { keyTypes, storageType } = getKeyTypes({
    types,
    key: storage.type,
  })
  // NOTE: static / dynamic arrays and struct are not supported atm
  const isUnsupportedType =
    storageType.encoding === "dynamic_array" ||
    !!storageType?.members?.length ||
    !!storageType.base

  const ethGetStorage = () => {
    let slot = storage.slot
    for (let i = 0; i < keyTypes.length; i++) {
      const key = inputs[i]
      slot = keccak256(
        encodePacked(["uint256", "uint256"], [BigInt(key), slot]),
      )
    }

    const props = {
      address,
      slot,
    }

    return rpc.getStorageAt(props as any).then((res: any) => {
      let input: string = res.toString().slice(2)
      if (storage.offset || type.numberOfBytes != "32") {
        input = input.slice(
          storage.offset * 2,
          (storage.offset + parseInt(type.numberOfBytes)) * 2,
        )
      }

      input = "0x" + input
      try {
        let val = ""
        if (storageType.label === "address") {
          val = input
        } else if (storageType.encoding === "bytes") {
          // See https://docs.soliditylang.org/en/v0.8.7/internals/layout_in_storage.html#bytes-and-string
          const isLongStringFormat = (BigInt(input) & BigInt(1)) === BigInt(1)
          if (isLongStringFormat) {
            val = "decoding of long strings is unsupported"
          } else {
            val = Buffer.from(input.slice(2), "hex").toString("utf-8")
          }
        } else {
          val = decodeAbiParameters(
            [{ type: storageType.label }],
            input as Hex,
          ).toString()
        }

        if (slot != storage.slot) {
          val += ` (mapped slot: ${slot})`
        }

        setStatus(val)
      } catch (err) {
        console.error(err)
        setStatus("failed to decode")
      }
    })
  }

  return (
    <TreeItemBasic
      itemId={`storageitem_${id}`}
      title={storage.label}
      subtitle={type.label.replace(/ /g, "")}
    >
      <div className="my-2 mr-4 flex flex-col gap-2 text-black-500">
        <p className="text-xs dark:text-gray-200">
          base slot: {storage.slot}, offset: {storage.offset}, size:{" "}
          {type?.numberOfBytes} bytes
        </p>

        <p>
          {isUnsupportedType ? (
            <p className="text-xs dark:text-gray-200">
              We currently don&apos;t support decoding of this storage slot
              type. Your contribution is welcome.
            </p>
          ) : (
            <>
              <div className="flex w-full flex-col gap-1">
                <p className="text-xs dark:text-gray-200">
                  <p>{status ? `results: ${status}` : ""}</p>
                </p>

                {keyTypes.map((keyType, i: number) => (
                  <TextField
                    key={i}
                    disabled={isUnsupportedType}
                    size="small"
                    className="w-full bg-gray-200 dark:invert"
                    label={types[keyType].label}
                    onChange={(e: any) => {
                      inputs[i] = e.target.value
                      setInputs([...inputs])
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-row-reverse pt-2">
                <Button
                  disabled={
                    keyTypes.some((_, index) => {
                      return inputs[index] === undefined
                    }) || isUnsupportedType
                  }
                  onClick={ethGetStorage}
                  size="xs"
                  className="font-medium"
                >
                  Read
                </Button>
              </div>
            </>
          )}
        </p>
      </div>
    </TreeItemBasic>
  )
}

type DeploymentItemProps = {
  deployment: DeploymentInfo
  children?: any
  onSelect: (deployment: DeploymentInfo, artifact?: ContractArtifact) => void
}

export const DeploymentItem = ({
  deployment,
  onSelect,
}: DeploymentItemProps) => {
  const router = useRouter()
  const { loadDeployment, removeDeployment } = useDeployments(router)
  const implementations = deployment.getImplementations()

  const title = (
    <div className="whitespace-nowrap">
      <div className="flex gap-2">
        <span>{deployment.etherscanInfo.ContractName}</span>

        <button
          type="button"
          value=""
          className="ri-close-large-line mr-1"
          onClick={() => {
            if (confirm("Are you sure you want to remove this contract?")) {
              removeDeployment(deployment)
            }
          }}
        >
          <Icon
            size="sm"
            name="close-large-line"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          />
        </button>
      </div>
      <p className="text-xs">
        {deployment.address}
        {deployment.context ? " @ " + deployment.rootContext().address : ""}
      </p>
    </div>
  )

  return (
    <TreeItemBasic
      itemId={"deployment_" + deployment.id}
      title={title}
      onSelect={() => onSelect(deployment)}
    >
      <TreeItem
        itemId={"ti_compiler_" + deployment.id}
        label={"Compiler: " + deployment.etherscanInfo?.CompilerVersion}
      />

      {deployment.storageLayout && (
        <TreeItem itemId={"ti_storage_" + deployment.id} label="Storage">
          {deployment.storageLayout.storage.map((storage: any, i: number) => (
            <StorageLayoutItem
              key={i}
              id={storage.astId.toString()}
              address={deployment.rootContext().address}
              storage={storage}
              types={deployment.storageLayout.types}
            />
          ))}
        </TreeItem>
      )}

      <TreeItem itemId={"ti_functions_" + deployment.id} label="Functions">
        {deployment.abi
          .filter((a) => a.type == "function")
          .map((funcAbi, i: number) => (
            <FunctionAbiItem
              key={i}
              id={i.toString()}
              address={deployment.rootContext().address}
              funcAbi={funcAbi as AbiFunction}
            />
          ))}
      </TreeItem>

      <TreeItem
        itemId={"ti_impls_" + deployment.id}
        label={
          <span>
            Implementations
            <button
              className="mx-2 rounded-xl"
              onClick={() => {
                const addr = prompt("address")
                if (addr) {
                  loadDeployment(addr, deployment)
                }
              }}
            >
              <Icon
                size="sm"
                name="add-fill"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              />
            </button>
          </span>
        }
      >
        {implementations?.map((impl: DeploymentInfo) => (
          <DeploymentItem
            key={"impl_" + deployment.address + "_" + impl.address}
            deployment={impl}
            onSelect={onSelect}
          />
        ))}
      </TreeItem>
    </TreeItemBasic>
  )
}
