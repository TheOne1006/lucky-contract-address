import { GITHUB_REPO_URL } from "@/util/constants"

import { Container } from "@/components/ui/Container"

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 py-4 dark:border-black-600">
      <Container>
        <div className="flex items-start justify-between text-tiny text-gray-500">
          <div className="flex flex-col leading-6 md:flex-row">
            {/* <span>
              Brought to you by{" "}
              <a
                className="font-medium underline"
                href="https://dune.com/home"
                target="_blank"
                rel="noreferrer"
              >
                Dune
              </a>
              .
            </span> */}

            <span className="md:mx-2">
              {/* Powered by{" "}
              <a
                className="font-medium underline"
                href="https://github.com/ethereumjs/ethereumjs-monorepo"
                target="_blank"
                rel="noreferrer"
              >
                EthereumJS
              </a>{" "}
              and{" "}
              <a
                className="font-medium underline"
                href="https://github.com/ethereum/solc-js"
                target="_blank"
                rel="noreferrer"
              >
                SolcJS
              </a>
              . */}
            </span>
          </div>

          <div>
            <a
              className="underline"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
