import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import cn from "clsx"
import Link from "next/link"
import { useTranslation } from "next-i18next"

import { GITHUB_REPO_URL } from "@/util/constants"

import NavLink from "@/components/NavLink"
import ThemeSelector from "@/components/ThemeSelector"
import LangSelector from "@/components/LangSelector"
import { Container, Logo, Hamburger } from "@/components/ui"

const Nav = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const { t } = useTranslation("common")

  return (
    <nav className="fixed inset-x-0 top-0 z-40 bg-white py-2 dark:bg-black-800">
      <Container>
        <div className="flex h-10 items-center justify-between">
          <Link legacyBehavior href="/" passHref>
            <a>
              <Logo />
            </a>
          </Link>

          <ul
            className={cn(
              "fixed flex w-full flex-col items-start justify-between px-2 py-2 shadow-md transition-all md:static md:w-auto md:flex-row md:items-center md:py-0 md:shadow-none",
              {
                "left-0 bg-white dark:bg-black-800 md:bg-transparent dark:md:bg-transparent":
                  isMenuVisible,
                "-left-full": !isMenuVisible,
              },
            )}
            style={{ top: 56 }}
          >
            <NavLink href="/contract">{t("nav.contract")}</NavLink>
            <NavLink href="/lucky">{t("nav.lucky")}</NavLink>
            <NavLink href="/logs">{t("nav.logs")}</NavLink>
            <NavLink href={GITHUB_REPO_URL} external>
              GitHub
            </NavLink>

            {/* <li className="hidden lg:inline-block">
              <KBarButton />
            </li> */}
          </ul>

          <div className="ml-auto flex items-center">
            {/* <ChainSelector /> */}
            <div className="connect-button">
              <ConnectButton label="Connect Wallet" accountStatus="avatar" />
            </div>
            <LangSelector />
            <ThemeSelector />
            {/*  */}
          </div>

          <Hamburger
            isActive={isMenuVisible}
            onClick={() => setIsMenuVisible(!isMenuVisible)}
          />
        </div>
      </Container>
    </nav>
  )
}

export default Nav
