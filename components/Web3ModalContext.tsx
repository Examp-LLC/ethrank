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
import type UAuthSPA from '@uauth/js'
// import * as UAuthWeb3Modal from '@uauth/web3modal'
import React, {useContext, useEffect, useMemo, useState} from 'react'
import Web3 from 'web3'
import * as Web3Modal from 'web3modal'
import Router from 'next/router';

export interface Web3ModalContextValue {
  web3modal: Web3Modal.default
  connect: (id?: string, redirect?: boolean) => Promise<void>
  disconnect: () => Promise<void>
  networkId?: number
  chainId?: number
  provider?: any
  web3?: Web3
  address?: string
  isConnected: boolean
  isLoading: boolean
  error?: Error
  user: any
  uauth: UAuthSPA
}

export const Web3ModalContext = React.createContext<Web3ModalContextValue>(
  null as any,
)

export interface Web3ModalProviderProps extends Partial<Web3Modal.ICoreOptions> {
  onNewWeb3Modal?(web3modal: any): void
  uauth: UAuthSPA
}

export const Web3ModalProvider: React.FC<Web3ModalProviderProps> = ({
  children,
  onNewWeb3Modal,
  ...options
}) => {
  const [networkId, setNetworkId] = useState<number>()
  const [chainId, setChainId] = useState<number>()
  const [provider, setProvider] = useState<any>()
  const [address, setAddress] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [user, setUser] = useState<any>()

  const uauth = options.uauth;

  const web3modal = useMemo(() => {
    console.log('New Web3Modal instance!')
    const w3m = new Web3Modal.default(options)
    if (typeof onNewWeb3Modal === 'function') {
      onNewWeb3Modal(w3m)
    }
    return w3m
  }, [])

  const web3 = useMemo(() => {
    console.log('New Web3 instance!')
    return provider ? new Web3(provider) : undefined
  }, [provider])

  const connect = async (id?: string, redirect?: boolean) => {
    console.log('Connecting...')
    setLoading(true)
    setError(undefined)
    try {
      const provider = id
        ? await web3modal.connectTo(id)
        : await web3modal.connect()

      setProvider(provider)

      const tempWeb3 = new Web3(provider)

      const [address] = await tempWeb3.eth.getAccounts()

      setChainId(await tempWeb3.eth.getChainId())
      setNetworkId(await tempWeb3.eth.net.getId())

      setError(undefined)
      setLoading(false)

      if (web3modal.cachedProvider === 'custom-uauth') {
        console.log(address);
        const user = await uauth.user()
        setUser(user)
        setAddress(user.wallet_address)
        if (redirect) {
          Router.push(`/address/${user.wallet_address}?ud=${user.sub}`)
        }
      } else {
        setAddress(address)
        if (redirect) {
          Router.push(`/address/${address}`)
        }
      }

    } catch (e) {
      setError(e as Error)
      setLoading(false)

      console.error('Failed to connect!')
    }
  }

  const disconnect = async () => {
    console.log('Disconnecting...')

    if (web3modal.cachedProvider === 'custom-uauth') {
      web3modal.clearCachedProvider()
      try {
        await uauth.logout()
      } catch (e) {
        console.error('Error during uauth disconnect', e)
      }
    }
    if (provider && provider.close) {
      await provider.close();
    }
    web3modal.clearCachedProvider()
    unsubscribeFromProvider(provider)
    setProvider(undefined)
    setAddress(undefined)
    setLoading(false)
    setChainId(undefined)
    setNetworkId(undefined)

    console.log('Disconnected!')
  }

  // Web3Modal event emitter

  useEffect(() => {
    const onErrorEvent = (error: any) => {
      console.error('web3modal.ERROR_EVENT', error)
      setError(error)
    }

    const onCloseEvent = () => {
      console.log('web3modal.CLOSE_EVENT')
    }

    const onConnectEvent = async (provider: any) => {
      console.log('web3modal.CONNECT_EVENT', provider)
    }

    console.log('Attaching event listeners to web3modal!')
    web3modal.on(Web3Modal.ERROR_EVENT, onErrorEvent)
    web3modal.on(Web3Modal.CLOSE_EVENT, onCloseEvent)
    web3modal.on(Web3Modal.CONNECT_EVENT, onConnectEvent)

    return () => {
      console.log('Removing event listeners to web3modal!')
      web3modal.off(Web3Modal.ERROR_EVENT, onErrorEvent)
      web3modal.off(Web3Modal.CLOSE_EVENT, onCloseEvent)
      web3modal.off(Web3Modal.CONNECT_EVENT, onConnectEvent)
    }
  }, [web3modal])

  // Provider event emitter

  const onClose = () => {
    console.log('provider.close')

    setProvider(undefined)
    setAddress(undefined)
  }

  const onAccountsChanged = async ([address]: string[]) => {
    console.log('provider.accountsChanged', [address])
    setAddress(address)

    Router.push(`/address/${address}`)
  }

  const onChainChanged = async (chainId: number) => {
    console.log('provider.chainChanged', chainId)
    setChainId(chainId)
    setNetworkId(await web3!.eth.net.getId())
  }

  const onNetworkChanged = async (networkId: number) => {
    console.log('provider.networkChanged', networkId)
    setNetworkId(networkId)
    setChainId(await web3!.eth.getChainId())
  }

  const subscribeToProvider = (provider: any) => {
    console.log('Attaching event listeners to provider...')

    if (provider == null || typeof provider.on !== 'function') {
      return
    }

    provider.on('close', onClose)
    provider.on('accountsChanged', onAccountsChanged)
    provider.on('chainChanged', onChainChanged)
    provider.on('networkChanged', onNetworkChanged)

    console.log('Attached event listeners to provider!')
  }

  const unsubscribeFromProvider = (provider: any) => {
    console.log('Removing event listeners to provider...')

    if (provider == null || typeof provider.removeListener !== 'function') {
      return
    }

    provider.removeListener('close', onClose)
    provider.removeListener('accountsChanged', onAccountsChanged)
    provider.removeListener('chainChanged', onChainChanged)
    provider.removeListener('networkChanged', onNetworkChanged)

    console.log('Removed event listeners to provider!')
  }

  useEffect(() => {
    subscribeToProvider(provider)
    return () => {
      unsubscribeFromProvider(provider)
    }
  }, [provider])

  const value: Web3ModalContextValue = {
    web3modal,
    connect,
    disconnect,
    networkId,
    chainId,
    provider,
    web3,
    address,
    isConnected: provider != null,
    isLoading: loading,
    error,
    user,
    uauth,
  }

  return <Web3ModalContext.Provider value={value}>{children}</Web3ModalContext.Provider>
}

export const useWeb3Modal = () => useContext(Web3ModalContext)