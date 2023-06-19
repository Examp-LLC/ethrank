import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const chains = [mainnet]
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <Component {...pageProps} />
        </WagmiConfig>
      </QueryClientProvider>
      <Web3Modal
        projectId={process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''}
        ethereumClient={ethereumClient} 
        themeVariables={{
          '--w3m-font-family': 'Roboto, sans-serif',
          '--w3m-accent-color': 'var(--main-color2)',
          '--w3m-background-color': 'var(--main-color2)'
        }}
      />
    </>
  )
}
