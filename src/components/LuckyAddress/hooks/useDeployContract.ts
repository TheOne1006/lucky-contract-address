import { useState, useEffect, useCallback } from "react"
import { toast } from "react-toastify"
import { encodeFunctionData, getAddress } from "viem"
import { useConfig, useChainId } from "wagmi"
import {
  estimateGas as actionEstimateGas,
  writeContract,
  waitForTransactionReceipt,
  getGasPrice,
} from "@wagmi/core"
import { luckyFactoryAbi } from "@/util/LuckyFactory.abi"
import { parseDeployReceipt } from "@/util/abi"
import { addLog } from "@/core/deployedContractsLog"
import { IConsoleOutput } from "../types"

export function useDeployAddress(
  log: (msg: any, type?: IConsoleOutput["type"]) => void,
  factoryAddress: `0x${string}`,
  deployBytecode: `0x${string}`,
) {
  const config = useConfig()
  const chainId = useChainId()

  // estimate usage Gwei  = Gas × Gas Price
  const [estimateGas, setEstimateGas] = useState<bigint>(BigInt(0))
  const [gasPrice, setGasPrice] = useState<bigint>(BigInt(0)) // wei
  const [estimateWei, setEstimateWei] = useState<bigint>(BigInt(0)) // unit wei
  const [openDeployModal, setOpenDeployModal] = useState(false)
  const [selectSaltAddress, setSelectSaltAddress] = useState<{
    salt: bigint
    address: `0x${string}`
  }>({
    salt: BigInt(0),
    address: "" as `0x${string}`,
  })
  const [isDeploying, setIsDeploying] = useState(false)

  useEffect(() => {
    // check if factoryAddress and deployBytecode is valid
    if (factoryAddress.length != 42 || deployBytecode.length < 60 || !config)
      return
    const estimateDeployGas = async () => {
      const mockDeploySalt = BigInt(
        "21711016731996786641919559689128982722488122124807605757398297001483712095294",
      )
      const deployData = encodeFunctionData({
        abi: luckyFactoryAbi,
        functionName: "deploy",
        args: [mockDeploySalt, deployBytecode],
      })
      // 并行获取 gas 价格和预估 gas 用量
      const [gasPrice, gas] = await Promise.all([
        getGasPrice(config),
        actionEstimateGas(config, {
          data: deployData,
          to: getAddress(factoryAddress),
        }),
      ])
      setGasPrice(gasPrice)
      setEstimateGas(gas)
      setEstimateWei(gas * gasPrice)
    }

    estimateDeployGas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factoryAddress, deployBytecode, chainId])

  function onOpenDeployModal(salt: bigint, address: `0x${string}`) {
    setOpenDeployModal(true)
    setSelectSaltAddress({
      salt,
      address: getAddress(address),
    })
  }

  function onCloseDeployModal() {
    setOpenDeployModal(false)
  }

  const onDeployContract = useCallback(
    async (salt: bigint, valueWei?: string) => {
      // check if factoryAddress and deployBytecode is valid
      if (factoryAddress.length != 42 || deployBytecode.length < 60 || !config)
        return

      setIsDeploying(true)

      try {
        const transcationHash = await writeContract(config, {
          abi: luckyFactoryAbi,
          address: getAddress(factoryAddress),
          functionName: "deploy",
          args: [salt, deployBytecode],
          // value Wei
          value: valueWei ? BigInt(valueWei) : undefined,
        })
        toast.info(`waiting receipt comfirmation`)
        log(`waiting receipt comfirmation with ${transcationHash}`)

        // 等待交易完成
        const receipt = await waitForTransactionReceipt(config, {
          hash: transcationHash,
        })

        const result = parseDeployReceipt(receipt)

        toast.success(`deploy success: ${result?.deployedAddress}`)
        log(`deploy success: ${result?.deployedAddress}`)

        addLog({
          address: result?.deployedAddress.toString() as `0x${string}`,
          salt: salt,
          sender: receipt.from as `0x${string}`,
          txHash: transcationHash,
          chainId: config.getClient().chain?.id as number,
          factoryAddress: getAddress(factoryAddress) as `0x${string}`,
        })
      } catch (error) {
        console.error(error)
        toast.error(`deploy failed`)
        log(`deploy failed ${error}`, "error")
      } finally {
        setIsDeploying(false)
      }
    },
    [config, factoryAddress, deployBytecode],
  )

  const onDeploy = (salt: bigint, valueGWei?: string) => {
    onDeployContract(salt, valueGWei)
  }

  return {
    isDeploying,
    openDeployModal,
    onOpenDeployModal,
    onCloseDeployModal,
    selectSaltAddress,
    estimateGas,
    gasPrice,
    estimateWei,
    onDeploy,
  }
}
