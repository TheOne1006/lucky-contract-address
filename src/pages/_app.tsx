import { ReactElement } from "react"
import { appWithTranslation } from "next-i18next"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import {
  RainbowKitProvider,
  // darkTheme,
  // lightTheme,
  // cssStringFromTheme,
} from "@rainbow-me/rainbowkit"
import { ToastContainer } from "react-toastify"

import { config } from "../wagmi"
import { AppPropsWithLayout } from "@/types/layout"

import "@rainbow-me/rainbowkit/styles.css"
import "react-toastify/dist/ReactToastify.css"
import "../styles/globals.css"
import "../styles/rainbowkit.css"
import "../styles/rainbow.css"

const client = new QueryClient()

function Main({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page)

  return (
    <WagmiProvider config={config}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <QueryClientProvider client={client}>
          <RainbowKitProvider modalSize="compact">
            {getLayout(<Component {...pageProps} />)}
          </RainbowKitProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            // hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
        </QueryClientProvider>
      </ThemeProvider>
    </WagmiProvider>
  )
}

export default appWithTranslation(Main)
