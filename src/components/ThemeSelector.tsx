import { useTheme } from "next-themes"

import { Icon, Button } from "@/components/ui"

const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleThemChange = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button transparent onClick={handleThemChange}>
      {resolvedTheme === "dark" ? (
        <Icon
          name="contrast-2-fill"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        />
      ) : (
        <Icon
          name="contrast-2-line"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        />
      )}
    </Button>
  )
}

export default ThemeSelector
