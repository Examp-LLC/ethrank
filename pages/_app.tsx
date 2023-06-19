import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
// import { Web3Modal } from "@web3modal/react";
// import { configureChains, createClient, mainnet, WagmiConfig } from "wagmi";
// import {
// EthereumClient,
// modalConnectors,
// walletConnectProvider,
// } from "@web3modal/ethereum";

// import { publicProvider } from 'wagmi/providers/public'
// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
// import { EthereumProvider } from '@walletconnect/ethereum-provider'
// import { mainnet, polygonMumbai } from "wagmi/chains";

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'

const chains = [mainnet]
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

// if (!process.env.NEXT_PUBLIC_WC_PROJECT_ID)
//   throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')

// const chains = [mainnet];

// // Wagmi client
// const { provider } = configureChains(chains, [
//   walletConnectProvider({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID }),
// ])
// const wagmiClient = createClient({
//   autoConnect: true,
//   connectors: modalConnectors({ appName: "web3Modal", chains }),
//   provider,
// });

// // Web3Modal Ethereum Client
// const ethereumClient = new EthereumClient(wagmiClient, chains);

const queryClient = new QueryClient();
console.log(queryClient)


export default function App({ Component, pageProps }: AppProps) {


  // const [client, setClient] = useState<Client>()
  // const [connector, setConnector] = useState<Connector>()
  // const [provider, setProvider] = useState<typeof EthereumProvider>()

  // useEffect(async () => {

  //   const connector = new WalletConnectConnector({
  //     options: {
  //       projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  //       showQrModal: false
  //     }
  //   })
    
  //   const provider = await EthereumProvider.init({
  //     projectId: 'WALLETCONNECT_PROJECT_ID', // required
  //     chains: [1], // required
  //     showQrModal: false // requires @walletconnect/modal
  //   })
    
  //   const client = createClient({
  //     autoConnect: true,
  //     provider,
  //     connectors: [connector],
  //   });

  //   setConnector(connector);
  //   setProvider(provider);
  //   setClient(client);
    
  // })
  

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
      />
    </>
  )
}
