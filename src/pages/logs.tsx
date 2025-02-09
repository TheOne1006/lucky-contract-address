// import type { NextPage } from "next"
import Head from "next/head"
import DeployedLogs from "@/components/DeployedLogs"
import HomeLayout from "@/components/layouts/Home"
import { Container } from "@/components/ui"
import { NextPageWithLayout } from "@/types/layout"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
// export is required for getStaticProps
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

const DeployedLogsPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <meta property="og:type" content="website" />
        <title>Lucky Contract Address -Deployed Logs</title>
        <meta
          name="description"
          content="Lucky Contract Address - Deployed Logs"
        />
      </Head>

      <Container>
        <DeployedLogs />
      </Container>
    </>
  )
}

DeployedLogsPage.getLayout = function getLayout(page: React.ReactNode) {
  return <HomeLayout>{page}</HomeLayout>
}

// export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
//   props: {
//     ...(await serverSideTranslations(locale ?? "en", ["common"])),
//   },
// })

export default DeployedLogsPage
