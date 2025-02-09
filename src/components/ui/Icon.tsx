import React from "react"
import {
  RiContrast2Fill,
  RiContrast2Line,
  RiAddLine,
  RiSubtractLine,
  RiDeleteBin2Line,
  RiSaveLine,
  RiImportLine,
  RiFileCopyLine,
  RiArrowDropLeftLine,
  RiArrowDropDownLine,
  RiEthLine,
  RiTranslate,
} from "@remixicon/react"
import cn from "clsx"

const svgDict: { [key: string]: any } = {
  "contrast-2-fill": RiContrast2Fill,
  "contrast-2-line": RiContrast2Line,
  "add-line": RiAddLine,
  "subtract-line": RiSubtractLine,
  "delete-bin-2-line": RiDeleteBin2Line,
  "save-line": RiSaveLine,
  "import-line": RiImportLine,
  "file-copy-line": RiFileCopyLine,
  "arrow-drop-left-line": RiArrowDropLeftLine,
  "arrow-drop-down-line": RiArrowDropDownLine,
  "eth-line": RiEthLine,
  translate: RiTranslate,
}

type Props = {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}

// const sizes = {
//   sm: 14,
//   md: 16,
//   lg: 24,
// }
export const Icon: React.FC<Props> = ({ name, className, size = "md" }) => {
  const IconComponent = svgDict[name]

  if (!IconComponent) {
    console.warn(`Icon ${name} not found`)
    return null
  }

  return (
    <IconComponent
      className={cn(
        "inline-block",
        {
          "h-3.5 w-3.5": size === "sm",
          "h-4 w-4": size === "md",
          "h-6 w-6": size === "lg",
        },
        className,
      )}
    />
  )
}
