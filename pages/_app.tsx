import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'

import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";

import { Web3Modal } from "@web3modal/react";

import { configureChains, createClient, WagmiConfig } from "wagmi";

import { mainnet, polygonMumbai } from "wagmi/chains";

if (!process.env.NEXT_PUBLIC_WC_PROJECT_ID)
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')

const chains = [mainnet, polygonMumbai];

// Wagmi client
const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID }),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "web3Modal", chains }),
  provider,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains);

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <><QueryClientProvider client={ queryClient }>

    <WagmiConfig client={wagmiClient}>
        <Component {...pageProps} />
        </WagmiConfig>
      </QueryClientProvider>
    <Web3Modal
      projectId={process.env.NEXT_PUBLIC_WC_PROJECT_ID}
      ethereumClient={ethereumClient}
    />
    </>
  )
}
