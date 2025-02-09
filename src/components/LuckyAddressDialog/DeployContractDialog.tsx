import { useTranslation } from "next-i18next"
import { useState, useEffect } from "react"
import {
  parseEther,
  formatGwei,
  getAddress,
  formatUnits,
  gweiUnits,
  parseUnits,
} from "viem"
import { useBalance, useAccount, useBytecode } from "wagmi"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Button, Spinner } from "@/components/ui"
import { ValueUnit, Decimals } from "@/util/common.constants"

function formatWeiToString(wei: bigint, unit?: ValueUnit) {
  switch (unit) {
    case ValueUnit.Gwei:
      return formatUnits(wei.valueOf(), Decimals.Gwei)
    case ValueUnit.Finney:
      return formatUnits(wei.valueOf(), Decimals.Finney)
    case ValueUnit.Ether:
      return formatUnits(wei.valueOf(), Decimals.Ether)
    default:
      return wei.toString()
  }
}

function parseUnitToWei(value: string, unit?: ValueUnit) {
  switch (unit) {
    case ValueUnit.Gwei:
      return parseUnits(value, Decimals.Gwei)
    case ValueUnit.Finney:
      return parseUnits(value, Decimals.Finney)
    case ValueUnit.Ether:
      return parseUnits(value, Decimals.Ether)
    default:
      return parseUnits(value, Decimals.Wei)
  }
}

type DeployContractDialogProps = {
  open: boolean
  isDeploying: boolean
  onClose: () => void
  onDeploy: (salt: bigint, value?: string) => void
  factoryAddress: `0x${string}`
  deploySalt: bigint
  deployAddress: string
  estimateGas: bigint
  gasPrice: bigint // wei
  estimateWei: bigint // wei
}

export default function DeployContractDialog({
  open,
  isDeploying,
  onClose,
  onDeploy,
  deploySalt,
  deployAddress,
  estimateGas,
  gasPrice,
  estimateWei,
}: DeployContractDialogProps) {
  const { t } = useTranslation("common")

  const { data: deployAddressCode } = useBytecode({
    address: deployAddress ? getAddress(deployAddress) : undefined,
  })

  const [donationAmount, setDonationAmount] = useState<string>("0")
  const account = useAccount()
  const { data: balance } = useBalance({
    address: account?.address as `0x${string}`,
  })
  const [valueUnit, setValueUnit] = useState<ValueUnit>(ValueUnit.Gwei)
  const isDeployAddressOccupied = !!deployAddressCode

  const deploySaltString = deploySalt.toString()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="dark:bg-black-400 dark:text-white">
        {t("label.DeployContract")}
      </DialogTitle>
      <DialogContent className="dark:bg-black-400 dark:text-white">
        <div className="space-y-6">
          <div>
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-300">
              {t("label.DeployContractDescription")}
            </p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-500">
            <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
              <dt className="text-sm font-medium leading-6">
                {t("label.LuckyAddress")}
              </dt>
              <dd className="mt-1 flex items-center text-sm sm:col-span-5 sm:mt-0">
                {deployAddress}
                {isDeployAddressOccupied && (
                  <span className="ml-2 text-red-500">
                    ({t("status.Occupied")})
                  </span>
                )}
              </dd>
            </div>

            <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
              <dt className="text-sm font-medium leading-6">
                {t("label.LuckySalt")}
              </dt>
              <dd className="mt-1 flex items-center text-sm sm:col-span-5 sm:mt-0">
                {deploySaltString.length > 30 ? (
                  <span title={deploySaltString}>
                    {deploySaltString.slice(0, 15)}...
                    {deploySaltString.slice(-15)}
                  </span>
                ) : (
                  deploySaltString
                )}
              </dd>
            </div>

            <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
              <dt className="text-sm font-medium leading-6">
                {t("label.EstimateGas")}
              </dt>
              <dd className="mt-1 flex items-center text-sm sm:col-span-5 sm:mt-0">
                <span>{estimateGas.toString()} gas</span>
              </dd>
            </div>

            <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
              <dt className="text-sm font-medium leading-6">
                {t("label.EstimateGwei")}
              </dt>
              <dd className="mt-1 flex items-center text-sm sm:col-span-5 sm:mt-0">
                {formatWeiToString(estimateWei, valueUnit)} {valueUnit} ={" "}
                {estimateGas.toString()} x{" "}
                {formatWeiToString(gasPrice, valueUnit)} {valueUnit}
              </dd>
            </div>

            <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
              <dt className="text-sm font-medium leading-6">
                {t("label.DonationAmount")}
              </dt>
              <dd className="mt-1 flex items-center space-x-2 text-sm sm:col-span-5 sm:mt-0">
                {/* <input
                  type="number"
                  value={donationAmountGwei}
                  onChange={(e) => setDonationAmountGwei(e.target.value)}
                  min="0"
                  max={parseEther("0.5").toString()}
                  step="1"
                  className="w-40 rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
                />
                <span>GWEI</span> */}

                <div className="flex items-center rounded-md pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base placeholder:text-gray-400 focus:outline-none dark:bg-gray-700 sm:text-sm/6"
                  />
                  <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                    <select
                      value={valueUnit}
                      onChange={(e) => {
                        // 直接将选择的值转换为 ValueUnit 枚举值
                        setValueUnit(e.target.value as ValueUnit)
                      }}
                      className="col-start-1 row-start-1 w-full py-1.5 pl-3 pr-7 text-base text-gray-500 placeholder:text-gray-400 focus:outline-indigo-600 dark:bg-gray-700 dark:text-gray-300 sm:text-sm/6"
                    >
                      {[
                        ValueUnit.Wei,
                        ValueUnit.Gwei,
                        ValueUnit.Finney,
                        ValueUnit.Ether,
                      ].map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </dd>
            </div>

            <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
              <dt className="text-sm font-medium leading-6">
                {t("label.YourAmount")}
              </dt>
              <dd className="mt-1 flex items-center text-sm sm:col-span-5 sm:mt-0">
                {balance ? formatWeiToString(balance.value, valueUnit) : 0}{" "}
                {valueUnit}
              </dd>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="dark:bg-black-400 dark:text-white">
        <Button
          className="mr-4 bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-600"
          onClick={onClose}
          size="sm"
        >
          {t("action.Cancel")}
        </Button>
        <Button
          disabled={isDeployAddressOccupied || isDeploying}
          onClick={() => {
            const donationAmountWei = parseUnitToWei(donationAmount, valueUnit)

            onDeploy(deploySalt, donationAmountWei.toString())
          }}
          className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          size="sm"
        >
          {isDeploying && <Spinner size="xs" />}
          <span className="ml-1">
            {isDeploying ? t("action.Deploying") : t("action.Deploy")}
          </span>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
