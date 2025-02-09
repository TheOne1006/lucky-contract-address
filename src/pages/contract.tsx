import type { NextPage } from "next"
import Head from "next/head"
import type { GetStaticProps, InferGetStaticPropsType } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import ContractViewer from "@/components/ContractViewer"
import HomeLayout from "@/components/layouts/Home"
import { Container } from "@/components/ui"
import { NextPageWithLayout } from "@/types/layout"

const ContractPage: NextPageWithLayout = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <title>Lucky Contract Address - Contract Viewer</title>
        <meta
          name="description"
          content="Lucky Contract Address - Contract Viewer"
        />
      </Head>

      <Container>
        <ContractViewer />
      </Container>
    </>
  )
}

ContractPage.getLayout = function getLayout(page: React.ReactNode) {
  return <HomeLayout>{page}</HomeLayout>
}

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

export default ContractPage
