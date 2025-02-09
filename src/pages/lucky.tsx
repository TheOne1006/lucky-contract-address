import Head from "next/head"

import HomeLayout from "@/components/layouts/Home"
import { Container } from "@/components/ui"
import type { GetStaticProps, InferGetStaticPropsType } from "next"
// import { useTranslation, Trans } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { NextPageWithLayout } from "@/types/layout"
import LuckyAddress from "@/components/LuckyAddress"

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

const LuckyPage: NextPageWithLayout = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <title>Lucky Contract Address - Lucky</title>
        <meta
          name="description"
          content="Lucky Contract Address is an interactive tool for learning how to use opcodes, the stack behind smart contracts."
        />
      </Head>

      <Container>
        <LuckyAddress />
      </Container>
    </>
  )
}

LuckyPage.getLayout = (page: React.ReactNode) => <HomeLayout>{page}</HomeLayout>

export default LuckyPage
