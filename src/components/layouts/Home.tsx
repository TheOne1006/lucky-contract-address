import type { NextPage } from "next"
import Head from "next/head"

import { getAbsoluteURL } from "@/util/browser"

import Footer from "./Footer"
import Nav from "@/components/layouts/Nav"

const HomeLayout: NextPage<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Lucky Contract Address</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EVM Codes" />
        <meta
          property="og:description"
          content="Lucky Contract Address is a contract address generator based on the EVM."
        />
        <meta property="og:image" content={`${getAbsoluteURL("/og.png")}`} />
        <meta property="og:url" content={getAbsoluteURL()} />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen flex-col justify-between">
        <Nav />

        <main className="mb-auto mt-20 pb-10 md:mt-28">{children}</main>

        <Footer />
      </div>
    </>
  )
}

export default HomeLayout
