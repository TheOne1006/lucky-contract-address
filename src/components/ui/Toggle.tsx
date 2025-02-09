interface ToggleProps {
  checked: boolean
  onChange: () => void
  text: string
}

export const Toggle = ({ checked, onChange, text }: ToggleProps) => {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="peer sr-only"
      />
      <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full" />
      <span className="ms-3 text-sm text-gray-600 dark:text-gray-300">
        {text}
      </span>
    </label>
  )
}
