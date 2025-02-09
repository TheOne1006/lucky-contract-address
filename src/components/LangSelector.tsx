import clsx from "clsx"
import { useRouter } from "next/router"
import { Icon, Button } from "@/components/ui"
import { useState, useEffect, useRef } from "react"

const LangSelector = () => {
  const router = useRouter()
  // const { locale } = router
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLangChange = (newLocale: string) => {
    router.push(router.pathname, router.asPath, { locale: newLocale })
    setIsDropdownVisible(false)
  }

  return (
    <div className="relative">
      <Button
        transparent
        onClick={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <Icon
          name="translate"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        />
        {/* <span className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          {router.locale === "en" ? "English" : "中文"}
        </span> */}
      </Button>
      {/* Dropdown menu  */}
      <div
        ref={dropdownRef}
        id="dropdownNavbar"
        className={clsx(
          "absolute right-0 top-full z-50 mt-2 w-44 divide-y divide-gray-100 overflow-hidden rounded-lg bg-white font-normal shadow-sm dark:divide-gray-600 dark:bg-gray-700",
          {
            hidden: !isDropdownVisible,
          },
        )}
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-400"
          aria-labelledby="dropdownLargeButton"
        >
          <li>
            <button
              onClick={() => handleLangChange("en")}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              English
            </button>
          </li>
          <li>
            <button
              onClick={() => handleLangChange("zh")}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              中文
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default LangSelector
