import type { NextPage } from 'next'
import Head from 'next/head'
import { ReactNode } from 'react'
// import ConnectButtonProvider from '../components/ConnectButtonProvider'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { User } from '../lib/User.interface'
import styles from '../styles/Home.module.scss'
// import { useWeb3Modal } from './Web3ModalContext'

// add to this every new season
export const SEASONS = [
  'achievements_season1',
  'achievements_season2',
  'achievements_season3'
];

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
interface PageProps {
  children: ReactNode,
  title: string,
  user?: User
}

const Page = (props: PageProps) => {

  return (
      <div className={styles.container}>
        <Head>
          <title>{props.title}</title>
          <meta name="description" content="ETHRank - The Ethereum Leaderboard." />
          <link rel="icon" href="/favicon_season3.png" />
        </Head>

        <Header />

        <main className={styles.main}>
          {props.children}
        </main>

        <Footer />
      </div>
  )
}

export default Page
