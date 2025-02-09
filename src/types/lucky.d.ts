export type DeployParam = {
  id: number
  type: string
  value: string
}

export type ABI_PARAMETER_INPUT_MAP_ITEM = {
  element?: string // default is input
  inputType?: string // default is text
  regex?: RegExp // default none
  options?: any[] // default none
  isArray?: boolean // default false
  placeholder?: string // default none
  transform?: (value: any) => any
}
