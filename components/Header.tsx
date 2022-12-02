import Link from 'next/link';
import React, { useEffect, useState } from 'react';
/*
 * All content copyright 2022 Examp, LLC
 *
 * This file is part of ETHRank.
 * 
 * ETHRank is free software: you can redistribute 
 * it and/or modify it under the terms of the GNU General Public 
 * License as published by the Free Software Foundation, either 
 * version 3 of the License, or (at your option) any later version.
 * 
 * ETHRank is distributed in the hope that it will 
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
*/
import { CURRENT_SEASON } from '../lib/constants';
import styles from '../styles/Header.module.scss';
import btnStyles from '../styles/ConnectButton.module.scss';
import { ConnectButton, useAccount, useDisconnect } from '@web3modal/react'
import truncateEthAddress from 'truncate-eth-address';
// import ConnectButtonOuter from './ConnectButtonOuter';
// import { useWeb3Modal } from './Web3ModalContext';

const Header = () => {

  const { isConnected, address } = useAccount()
  const disconnect = useDisconnect()

  const [hasWalletPluginInstalled, setHasWalletPluginInstalled] = useState(true)
  const [manualAddressInput, setManualAddressInput] = useState('')
  const [isFlyoutMenuActive, setIsFlyoutMenuActive] = useState(false)

  // let isFirstLoad = true;

  // useEffect(() => {
  //   console.log(address);
  //   if (isConnected && address && isFirstLoad) {
  //     // redirect to user address
  //     Router.push(`/address/${address}`)
  //     isFirstLoad = false;
  //   }
  // }, [address])

  const expandMenu = () => {
    setIsFlyoutMenuActive(!isFlyoutMenuActive);
  }

  return (
  <div className={`${styles.header} header`}>
    <h1><img src="/favicon_season3.png" height="59" width="59" className={styles.logo} /><Link href="/"><a>ETHRank</a></Link> <span className="pill">Season {CURRENT_SEASON}</span></h1>
    <ul>
      <li>
        <Link href="/"><a>Home</a></Link>
      </li>
      <li>
        <Link href="/leaderboard"><a>Leaderboard</a></Link>
      </li>
    </ul>
    <div className={styles.btn}>
      { isConnected ? 
      (<div className={btnStyles.flyoutMenuWrapper} onClick={expandMenu}>
        {truncateEthAddress(address)}
      <div className={`${btnStyles.flyoutMenu} ${isFlyoutMenuActive ? '' : btnStyles.hidden}`}>
        <ul>
          <li><Link href={{
          pathname: '/address/[address]/',
          query: { address },
        }}>My Profile</Link></li>
          <li><Link href={{
          pathname: '/vault/[address]/',
          query: { address },
        }}>Vault</Link></li>
          <li><a href="#nogo" onClick={disconnect}>
        Disconnect
          </a></li>
        </ul>
      </div>
    </div>
    )
    :
    <div className={`${btnStyles.connect} connect`}>
      <ConnectButton  />
    </div>
    }
    </div>
  </div>
  )
}
export default Header;