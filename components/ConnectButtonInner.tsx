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
import React, { useEffect, useMemo, useState } from 'react'
import { useWeb3Modal } from './Web3ModalContext'
import Router from 'next/router';
import styles from '../styles/ConnectButton.module.scss';
import Link from 'next/link';
import truncateEthAddress from 'truncate-eth-address';

export interface ConnectBtnProps {
  home?: boolean;
}

const ConnectButtonInner = ({ home }: ConnectBtnProps) => {

  const { web3modal, connect, disconnect, isConnected, isLoading, address, error, user, uauth } =
    useWeb3Modal()

  const [hasWalletPluginInstalled, setHasWalletPluginInstalled] = useState(true)
  const [manualAddressInput, setManualAddressInput] = useState('')
  const [isFlyoutMenuActive, setIsFlyoutMenuActive] = useState(false)

  const expandMenu = () => {
    setIsFlyoutMenuActive(!isFlyoutMenuActive);
  }

  const handleConnect = async () => {
    await connect(undefined, true)
    // const user = await uauth.user()
    // setUser(user)
    // setAddress(user.wallet_address)
    // if (redirect) {
    // Router.push(`/address/${user.wallet_address}?ud=${user.sub}`)
    // }
  }

  const handleLogout = () => {
    disconnect()
  }

  if (home && hasWalletPluginInstalled) {
    setHasWalletPluginInstalled(false)
  }

  useEffect(() => {
    // Unstoppable edge case - modal gets stuck if session expires and we call connect()
    // Fix is to only call connect if session hasnt expired.
    // If it has, call disconnect() otherwise UD modal shows up first when clicking Connect Wallet (bad)
    if (localStorage['WEB3_CONNECT_CACHED_PROVIDER'] === '"custom-uauth"') {
      const localStorageRequestCache = JSON.parse(localStorage['request']);
      if (localStorageRequestCache.expiresAt > new Date().getTime()) {
        connect()
      } else {
        disconnect()
      }
    } else if (localStorage['WEB3_CONNECT_CACHED_PROVIDER']) {
      connect()
    }
    if (error) {
      console.error(String(error))
    }
  }, [error])

  if (isLoading) {
    return <span className={styles.loading}>Loading...</span>
  }

  if (isConnected && address && !home) {
    return (
      <div className={styles.flyoutMenuWrapper} onClick={expandMenu}>
        {truncateEthAddress(address)}
      <div className={`${styles.flyoutMenu} ${isFlyoutMenuActive ? '' : styles.hidden}`}>
        <ul>
          <li><Link href={{
          pathname: '/address/[address]/',
          query: { address },
        }}>My Profile</Link></li>
          <li><Link href={{
          pathname: '/vault/[address]/',
          query: { address },
        }}>Vault</Link></li>
          <li><a href="#nogo" onClick={handleLogout}>
        Disconnect
          </a></li>
        </ul>
      </div>
    </div>
    )
  }

  return <div className={`${styles.connect} connect`}>
    {!isConnected && hasWalletPluginInstalled && <div className={styles.btnWrapper}>
      <a href="#nogo" className={`${styles.btn} btn`} onClick={handleConnect}>Connect Wallet</a>
      <span>or <a href="#nogo" onClick={() => {
        setHasWalletPluginInstalled(false);
      }}>input address manually</a></span>
    </div>
    }
    {!hasWalletPluginInstalled && <form onSubmit={async (e) => {
      e.preventDefault();
      if (manualAddressInput.toLowerCase().indexOf('.eth') > -1) {
        Router.push(`/ensName/${manualAddressInput}`)
      } else if (manualAddressInput.toLowerCase().indexOf('.') > -1) {
        Router.push(`/unstoppableName/${manualAddressInput.toLowerCase()}`)
      } else {
        Router.push(`/address/${manualAddressInput}`)
      }
    }} className={styles.manualAddressInput}>

      <input type="text" value={manualAddressInput} placeholder={`Address or domain`} onChange={(e) => {
        setManualAddressInput(e.target.value);
      }} /> <button>Go</button>


      <div className={styles.tooltip}>
        <strong>examples</strong>
        <div className={styles.supported}>
          <ol>
            <li>Public address: <span>0xd3be5d3fe342e...</span></li>
            <li>Unstoppable Domains: <span>yourname.crypto</span></li>
            <li>ENS: <span>yourname.eth</span></li>
          </ol>
        </div>
      </div>

    </form>}
  </div>
}

export default ConnectButtonInner


