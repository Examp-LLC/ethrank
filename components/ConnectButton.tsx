
import React, { PropsWithChildren, ReactNode } from 'react';
import WalletLink from 'walletlink'
import * as UAuthWeb3Modal from '@uauth/web3modal'
import UAuthSPA from '@uauth/js'
import WalletConnectProvider from '@walletconnect/web3-provider'

import { Web3ModalProvider} from './Web3ModalContext'

// These options are used to construct the UAuthSPA instance.
export const uauthOptions: any = {
    clientID: process.env.NEXT_PUBLIC_UNSTOPPABLE_CLIENT_ID!,
    clientSecret: process.env.NEXT_PUBLIC_UNSTOPPABLE_CLIENT_SECRET!, // local
    redirectUri: process.env.NEXT_PUBLIC_UNSTOPPABLE_REDIRECT_URI!,

    // Must include both the openid and wallet scopes.
    scope: 'openid wallet',
}

const INFURA_ID = 'YOUR_INFURA_ID'

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        options: {
            infuraId: INFURA_ID, // required
        },
    },
    'custom-walletlink': {
        display: {
            logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
            name: 'Coinbase',
            description: 'Connect to Coinbase Wallet',
        },
        options: {
            appName: 'ethrank.io', // Your app name
            networkUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
            chainId: 1,
        },
        package: WalletLink,
        connector: async (_: any, options: any) => {
            const { appName, networkUrl, chainId } = options
            const walletLink = new WalletLink({
                appName,
            })
            const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
            await provider.enable()
            return provider
        },
    },
    'custom-uauth': {
        // The UI Assets
        display: UAuthWeb3Modal.display,
        // The Connector
        connector: UAuthWeb3Modal.connector,
        // The SPA libary
        package: UAuthSPA,

        // // The SPA libary options
        options: uauthOptions
    }
}


const ConnectButton = (props: PropsWithChildren<ReactNode>) => {

    return (
        <Web3ModalProvider
            cacheProvider={true}
            providerOptions={providerOptions}
            onNewWeb3Modal={UAuthWeb3Modal.registerWeb3Modal}
        >
            {/* <ConnectButtonInner /> */}
            {props.children}
        </Web3ModalProvider>
    )
}
export default ConnectButton
