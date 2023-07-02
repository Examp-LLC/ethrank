/*
 * All content copyright 2023 Examp, LLC
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
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Header.module.scss';
import btnStyles from '../styles/ConnectButton.module.scss';
// import { useWeb3ModalTheme, Web3Button } from '@web3modal/react'
import truncateEthAddress from 'truncate-eth-address';
import { useAccount, useDisconnect } from 'wagmi';
import { Web3Button } from '@web3modal/react'

const Header = () => {


  // const { setTheme } = useWeb3ModalTheme()
  // setTheme({ themeColor: 'green' });

  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  const [isFlyoutMenuActive, setIsFlyoutMenuActive] = useState(false)

  const expandMenu = () => {
    setIsFlyoutMenuActive(!isFlyoutMenuActive);
  }

  return (
    <div className={`${styles.header} header`}>
      <h1>
        <img src="/favicon_season4.png" height="59" width="59" className={styles.logo} /><Link href="/"><a>ETHRank</a></Link>
        <span className={`${styles.pill} pill`}>Season IV</span>
      </h1>
      <ul>
        <li>
          <Link href="/"><a>Home</a></Link>
        </li>
        <li>
          <Link href="/leaderboard"><a>Leaderboard</a></Link>
        </li>
      </ul>
      <div className={styles.btn}>
        {isConnected ?
          (<div><div className={styles.flyoutMenuWrapper} onClick={expandMenu}>
            <span className={`${styles.pill} pill`}>{truncateEthAddress(address || '')}</span>
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
                <li><a href="#nogo" onClick={
                  () => disconnect()
                }>
                  Disconnect
                </a></li>
              </ul>
            </div>
          </div>
          </div>
          )
          :
          <div className={`${btnStyles.connect} connect`}>
            <Web3Button />
          </div>
        }
      </div>
    </div>
  )
}
export default Header;