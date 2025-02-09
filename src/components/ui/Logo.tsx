import Image from "next/image"
// import ethereumLogo from 'public/ethereum_logo.png'

export const Logo: React.FC = () => {
  return (
    <div className="flex w-64 items-center text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
      <span style={{ paddingRight: "2px" }}>Lucky Contract</span>
      <Image
        alt="evm.codes logo"
        src="/ethereum_logo.png"
        width={20}
        height={20}
      />
      <span style={{ paddingLeft: "2px" }}> Address</span>
    </div>
  )
}
