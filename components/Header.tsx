import Link from 'next/link';
import React from 'react';
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
import { CURRENT_SEASON } from '../lib/constants';
import styles from '../styles/Header.module.scss';
import ConnectButtonOuter from './ConnectButtonOuter';
import { useWeb3Modal } from './Web3ModalContext';

const Header = () => {

  const { isConnected, isLoading, address, error, user } =
    useWeb3Modal()

  return (
  <div className={`${styles.header} header`}>
    <h1><Link href="/"><a>ETHRank</a></Link> <span className="pill">Season {CURRENT_SEASON}</span></h1>
    <ul>
      <li>
        <Link href="/"><a>Home</a></Link>
      </li>
      <li>
        <Link href="/leaderboard"><a>Leaderboard</a></Link>
      </li>
      {/* {isConnected && <li>
        <Link href={`/vault/${address}`}><a>Vault</a></Link>
      </li>} */}
    </ul>
    <div className={styles.btn}>
      <ConnectButtonOuter home={false} /> 
    </div>
  </div>
  )
}
export default Header;