import React from "react"
import cn from "clsx"
import type { GetStaticProps, InferGetStaticPropsType } from "next"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// import { ConnectButton } from "@rainbow-me/rainbowkit"
import Head from "next/head"

import HomeLayout from "@/components/layouts/Home"
import { Container, Logo } from "@/components/ui"

import { NextPageWithLayout } from "@/types/layout"

import HomePage from "@/components/HomePage"

const Home: NextPageWithLayout = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  return (
    <div>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Lucky Contract Address" />
        <meta
          name="description"
          content="Lucky Contract Address is a platform for finding and analyzing contract addresses on the Ethereum blockchain."
        />
      </Head>

      <Container>
        <HomePage />
      </Container>
    </div>
  )
}

Home.getLayout = (page: React.ReactNode) => <HomeLayout>{page}</HomeLayout>

// or getServerSideProps: GetServerSideProps<Props> = async ({ locale })
export const getStaticProps = async ({
  locale,
}: {
  locale: string | undefined
}) => {
  const translations = await serverSideTranslations(locale ?? "en", ["common"])

  return {
    props: {
      ...translations,
    },
  }
}
export default Home
