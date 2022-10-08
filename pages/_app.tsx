import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'

import { chains, providers } from '@web3modal/ethereum'
import type { ConfigOptions } from '@web3modal/react'
import { Web3Modal } from '@web3modal/react'

if (!process.env.NEXT_PUBLIC_WC_PROJECT_ID)
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')

const modalConfig: ConfigOptions = {
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  theme: 'dark',
  accentColor: 'default',
  ethereum: {
    appName: 'web3Modal',
    autoConnect: true,
    chains: [
      chains.mainnet,
      // chains.rinkeby,
      // chains.avalanche,
      // chains.avalancheFuji,
      chains.polygon,
      // chains.polygonMumbai
    ],
    providers: [providers.walletConnectProvider({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID })]
  }
}

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <><QueryClientProvider client={ queryClient }>
        <Component {...pageProps} />
      </QueryClientProvider>
      <Web3Modal config={modalConfig} />
    </>
  )
}
