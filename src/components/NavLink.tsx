import React from "react"

import cn from "clsx"
import Link from "next/link"

type Props = {
  href: string
  external?: boolean
  children: string
  className?: string
}

const NavLink: React.FC<Props> = ({
  href,
  children,
  className,
  external = false,
}) => {
  return (
    <li
      className={cn(
        "mx-4 my-2 inline-block text-sm text-gray-600 hover:text-gray-900 md:my-0 dark:text-gray-400 dark:hover:text-white",
        className,
      )}
    >
      <Link legacyBehavior href={href} passHref={external}>
        <a target={external ? "_blank" : "_self"}>{children}</a>
      </Link>
    </li>
  )
}

export default NavLink
