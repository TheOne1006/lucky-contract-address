import { ABI_PARAMETER_INPUT_MAP_ITEM } from "@/types"

const defaultConfig: ABI_PARAMETER_INPUT_MAP_ITEM = {
  element: "input",
  inputType: "text",
  regex: undefined,
  options: [],
  isArray: false,
  placeholder: undefined,
}

type AbiParameterInputProps = {
  config: ABI_PARAMETER_INPUT_MAP_ITEM
  disabled?: boolean
  className?: string
  onChange: (value: any) => void
  value?: any
}
const AbiParameterInput = ({
  config = defaultConfig,
  disabled = false,
  className,
  onChange,
  value,
}: AbiParameterInputProps) => {
  if (config.element === "select") {
    return (
      <select
        disabled={disabled}
        value={value}
        className={className}
        onChange={onChange}
      >
        {config?.options?.map((option) => {
          return (
            <option key={`${option}`} value={option}>
              {`${option}`}
            </option>
          )
        })}
      </select>
    )
  } else if (config.element === "textarea") {
    return (
      <textarea
        disabled={disabled}
        value={value}
        placeholder={config.placeholder}
        className={className}
        onChange={onChange}
      />
    )
  }

  return (
    <input
      disabled={disabled}
      value={value}
      type={config.inputType || "text"}
      placeholder={config.placeholder}
      className={className}
      onChange={onChange}
      pattern={config.regex?.toString()}
    />
  )
}

export default AbiParameterInput
