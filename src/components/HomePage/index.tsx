import { useState, useEffect } from "react"
import { formatEther, getAddress } from "viem"
import { Icon } from "@/components/ui"
import { useTranslation } from "next-i18next"
import Image from "next/image"

function HomePage() {
  const { t } = useTranslation("common")

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 py-16 text-center sm:py-20">
        {/* Decorative elements */}
        <div className="absolute left-0 top-0 -translate-x-1/2 translate-y-1/2 transform">
          <div className="animate-blob h-48 w-48 rounded-full bg-gradient-to-r from-purple-300/30 to-purple-400/30 blur-3xl filter"></div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 transform">
          <div className="animate-blob animation-delay-2000 h-48 w-48 rounded-full bg-gradient-to-r from-indigo-300/30 to-indigo-400/30 blur-3xl filter"></div>
        </div>
        <h1 className="rainbow-text mb-6 text-4xl font-bold sm:text-5xl">
          {t("home.title")}
        </h1>
        <p className="rainbow-text-subtle mx-auto mb-8 max-w-3xl text-xl">
          {t("home.subtitle")}
        </p>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-lg bg-gradient-to-br from-blue-100 to-indigo-200 p-6 shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-800 dark:from-blue-900/30 dark:to-indigo-800/30">
            <div className="mb-4 text-blue-600 dark:text-blue-400">
              <Image
                src="/images/multi-chain.svg"
                alt="Multi Chain Support"
                width={32}
                height={32}
                className="dark:invert"
              />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {t("home.features.multiChain.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("home.features.multiChain.description")}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-lg bg-gradient-to-br from-pink-100 to-purple-200 p-6 shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-800 dark:from-pink-900/30 dark:to-purple-800/30">
            <div className="mb-4 text-blue-600 dark:text-blue-400">
              <Image
                src="/images/lucky-address.svg"
                alt="Lucky Address Generation"
                width={32}
                height={32}
                className="dark:invert"
              />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {t("home.features.luckyAddress.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("home.features.luckyAddress.description")}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-lg bg-gradient-to-br from-cyan-100 to-teal-200 p-6 shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-lg dark:bg-gray-800 dark:from-cyan-900/30 dark:to-teal-800/30">
            <div className="mb-4 text-blue-600 dark:text-blue-400">
              <Image
                src="/images/smart-contract.svg"
                alt="Smart Contract Compilation"
                width={32}
                height={32}
                className="dark:invert"
              />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {t("home.features.smartContract.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("home.features.smartContract.description")}
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-12">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
          {t("home.howItWorks.title")}
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center transition-transform duration-300 hover:scale-105">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                1
              </span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              {t("home.howItWorks.steps.step1.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("home.howItWorks.steps.step1.description")}
            </p>
          </div>

          <div className="text-center transition-transform duration-300 hover:scale-105">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                2
              </span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              {t("home.howItWorks.steps.step2.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("home.howItWorks.steps.step2.description")}
            </p>
          </div>

          <div className="text-center transition-transform duration-300 hover:scale-105">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                3
              </span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              {t("home.howItWorks.steps.step3.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("home.howItWorks.steps.step3.description")}
            </p>
          </div>

          <div className="text-center transition-transform duration-300 hover:scale-105">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                4
              </span>
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              {t("home.howItWorks.steps.step4.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("home.howItWorks.steps.step4.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
