import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi' 
import { mainnet, optimism, optimismSepolia} from 'wagmi/chains'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''
const queryClient = new QueryClient()

const metadata = {
  name: 'ETHRank',
  description: 'The open source achievement system for every Ethereum address.',
  url: 'https://ethrank.io',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const wagmiConfigExternal = {
  chains: [
    mainnet,
    optimism,
    optimismSepolia
  ],
  enableCoinbase: false,
  projectId,
  metadata
}
// @ts-ignore
export const wagmiConfig = defaultWagmiConfig(wagmiConfigExternal)
createWeb3Modal({ wagmiConfig, projectId })

export default function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <Component {...pageProps} />
        </WagmiProvider>
      </QueryClientProvider>
    </>
  )
}
