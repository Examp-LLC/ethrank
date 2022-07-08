
import React, { PropsWithChildren, ReactNode, useMemo } from 'react';
import WalletLink from 'walletlink'
import * as UAuthWeb3Modal from '@uauth/web3modal'
/*
 * All content copyright 2022 Examp, LLC
 *
 * This file is part of some open source application.
 * 
 * Some open source application is free software: you can redistribute 
 * it and/or modify it under the terms of the GNU General Public 
 * License as published by the Free Software Foundation, either 
 * version 3 of the License, or (at your option) any later version.
 * 
 * Some open source application is distributed in the hope that it will 
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
*/
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

const INFURA_ID = 'aa29126d46224562ad769bca03dcf066'

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        options: {
            infuraId: INFURA_ID, // required
        },
    },
    'custom-walletlink': {
        display: {
            logo: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgPGNpcmNsZSBjeD0iNTEyIiBjeT0iNTEyIiByPSI1MTIiIHN0eWxlPSJmaWxsOiMwMDUyZmYiLz4KICAgPHBhdGggZD0iTTUxNi4zIDM2MS44M2M2MC4yOCAwIDEwOC4xIDM3LjE4IDEyNi4yNiA5Mi40N0g3NjRDNzQyIDMzNi4wOSA2NDQuNDcgMjU2IDUxNy4yNyAyNTYgMzcyLjgyIDI1NiAyNjAgMzY1LjY1IDI2MCA1MTIuNDlTMzcwIDc2OCA1MTcuMjcgNzY4YzEyNC4zNSAwIDIyMy44Mi04MC4wOSAyNDUuODQtMTk5LjI4SDY0Mi41NWMtMTcuMjIgNTUuMy02NSA5My40NS0xMjUuMzIgOTMuNDUtODMuMjMgMC0xNDEuNTYtNjMuODktMTQxLjU2LTE0OS42OC4wNC04Ni43NyA1Ny40My0xNTAuNjYgMTQwLjYzLTE1MC42NnoiIHN0eWxlPSJmaWxsOiNmZmYiLz4KPC9zdmc+Cg==`,
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


const uauth = UAuthWeb3Modal.getUAuth(UAuthSPA, uauthOptions)

const ConnectButton = (props: PropsWithChildren<ReactNode>) => {

    return (
        <Web3ModalProvider
            cacheProvider={true}
            uauth={uauth}
            providerOptions={providerOptions}
            onNewWeb3Modal={UAuthWeb3Modal.registerWeb3Modal}
        >
            {/* <ConnectButtonInner /> */}
            {props.children}
        </Web3ModalProvider>
    )
}
export default ConnectButton
