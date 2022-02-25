import UAuthSPA from '@uauth/js'
import * as UAuthWeb3Modal from '@uauth/web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { IProviderOptions } from 'web3modal'

const uauthOptions: UAuthWeb3Modal.IUAuthOptions = {
//   clientID: process.env.REACT_APP_CLIENT_ID!,
//   clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
//   redirectUri: process.env.REACT_APP_REDIRECT_URI!,

clientID: 'y1EqEPhqqQlG5AWclJ+zeUU5WReEdCVyPQrpQ7FsfVc=',
clientSecret: 'cFbY9OQHPxLw7g8k9CuZSoevh1Ls21EW4EPzQPzohQE',
redirectUri: 'http://localhost:3000',
  scope: 'openid wallet',
}

const providerOptions: IProviderOptions = {
  'custom-uauth': {
    display: UAuthWeb3Modal.display,
    connector: UAuthWeb3Modal.connector,
    package: UAuthSPA,
    options: uauthOptions,
  },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.REACT_APP_INFURA_ID,
    },
  },
}

export default providerOptions