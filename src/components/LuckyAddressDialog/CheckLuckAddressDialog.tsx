import { encodePacked, keccak256 } from "viem"
import { useEffect, useState } from "react"
import { useTranslation } from "next-i18next"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { Button, Toggle } from "@/components/ui"
import clsx from "clsx"

type CheckLuckAddressDialogProps = {
  open: boolean
  onClose: () => void
  bytecode?: string
  factoryAddress?: string
  validLuckMatchers?: string[]
  forceRecreate?: boolean
  uniqueIdSameToCache: boolean
  onSetForceRecreate: (forceRecreate: boolean) => void
  startGen: () => void
}

export default function CheckLuckAddressDialog({
  open,
  onClose,
  bytecode = "",
  factoryAddress,
  validLuckMatchers = [],
  forceRecreate = false,
  onSetForceRecreate,
  uniqueIdSameToCache,
  startGen,
}: CheckLuckAddressDialogProps) {
  const { t } = useTranslation("common")
  const [checksum, setChecksum] = useState<`0x${string}` | undefined>()

  useEffect(() => {
    if (open && bytecode && factoryAddress && validLuckMatchers.length > 0) {
      const validLuckMatchersStr = validLuckMatchers.join("_")
      const encodedData = encodePacked(
        ["address", "string", "string"],
        [factoryAddress as `0x${string}`, bytecode, validLuckMatchersStr],
      )
      const _checksum = keccak256(encodedData)
      setChecksum(_checksum.slice(0, 22) as `0x${string}`)
    }
  }, [open, bytecode, factoryAddress, validLuckMatchers])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="dark:bg-black-400 dark:text-white">
        {t("label.CheckTitle")}
      </DialogTitle>
      <DialogContent className="dark:bg-black-400 dark:text-white">
        <div className="space-y-6">
          <div>
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-300">
              {t("label.CheckDescription")}
            </p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-500">
            <div className="py-4">
              <dd className="overflow-y-auto whitespace-pre-wrap break-all text-sm leading-5 text-gray-500 dark:text-gray-400">
                Checksum:
                <span className="px-2 text-red-500">{checksum}</span>
              </dd>
            </div>

            <div className="py-4">
              <dt className="mb-2 text-sm font-medium leading-6">ByteCode</dt>
              <dd className="max-h-[300px] overflow-y-auto whitespace-pre-wrap break-all text-sm leading-5 text-gray-500 dark:text-gray-400">
                {bytecode}
              </dd>
            </div>

            <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
              <dt className="text-sm font-medium leading-6">Factory Address</dt>
              <dd className="mt-1 text-sm text-cyan-600 sm:col-span-5 sm:mt-0">
                {factoryAddress}
              </dd>
            </div>

            <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
              <dt className="text-sm font-medium leading-6">
                Luck Number List
              </dt>
              <dd className="mt-1 text-sm sm:col-span-5 sm:mt-0">
                <ul className="space-y-2">
                  {validLuckMatchers.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-1 items-center">
                        <span
                          className={clsx("text-sm leading-6", {
                            "text-red-600":
                              item.startsWith("/") && !item.endsWith("/"),
                            "text-green-600": typeof item === "string",
                          })}
                        >
                          {item}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>

            {!uniqueIdSameToCache && (
              <div className="py-4 sm:grid sm:grid-cols-6 sm:gap-4">
                <dt className="text-sm font-medium leading-6">
                  Force Recreate
                </dt>
                <dd className="mt-1 text-sm sm:col-span-5 sm:mt-0">
                  <Toggle
                    checked={forceRecreate}
                    onChange={() => onSetForceRecreate(!forceRecreate)}
                    text="different from cache, need to recreate"
                  />
                </dd>
              </div>
            )}
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
          className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          // tooltip="Generate a new address"
          disabled={
            !bytecode ||
            !factoryAddress ||
            validLuckMatchers.length === 0 ||
            (!forceRecreate && !uniqueIdSameToCache)
          }
          onClick={() => {
            startGen()
          }}
          size="sm"
        >
          {t("action.Start")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
