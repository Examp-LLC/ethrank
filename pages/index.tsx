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

import type { NextPageContext } from 'next'
// import ConnectButtonOuter from '../components/ConnectButtonOuter'
import Page from '../components/Page'
import prisma from '../lib/prisma'
import { User } from '../lib/User.interface'
import styles from '../styles/Home.module.scss'
import btnStyles from '../styles/ConnectButton.module.scss'
import { CURRENT_SEASON } from '../lib/constants'
import Image from 'next/image'
import { useState } from 'react'
import Router from 'next/router'
import { useAccount } from 'wagmi';
import { useWeb3ModalTheme, Web3Button } from '@web3modal/react'

export async function getServerSideProps({ res }: NextPageContext) {

  if (res) {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=7200'
    )
  }

  const leaderboard = await prisma.address.findMany({
    take: 4,
    select: {
      address: true,
      name: true,
      score: true
    },
    where: {
      AND: {
        active: true,
        season: CURRENT_SEASON
      }
    },
    orderBy: {
      score: 'desc'
    }
  });
  const latestScores = await prisma.address.findMany({
    take: 4,
    select: {
      address: true,
      name: true,
      score: true
    },
    where: {
      AND: {
        active: true,
        season: CURRENT_SEASON
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return {
    props: {
      leaderboard: JSON.stringify(leaderboard),
      latestScores: JSON.stringify(latestScores),
    }
  }
}

interface HomeProps {
  leaderboard: string,
  latestScores: string
}

const getBannerText = () => {
  const rand = Math.random();
  const introText = [
    'Designed by jvck.eth!',
    'As seen on gitcoin',
    `What's your ETHRank?`,
    `Season 3 has started!`,
    `Season 3 has started!`,
    `Season 3 has started!`,
    `Season 3 has started!`,
    `Season 3 has started!`,
    `Season 3: it has begun!`,
    `Now this is podracing!`,
    `Positive vibrations to you in Season 3`,
    `Legalize it!`,
    `Promoting creative and ambitious web3 projects`,
    `We support integrity, creativity, and transparency`,
    `Over 80 projects featured in Season 3!`,
    `607a1c81de18f59cc2771b36e6abe (2/3)`,
    `There is no cow level`,
  ]
  return introText[Math.floor(Math.random() * introText.length)];
}

const bannerText = getBannerText();

const Home = ({ leaderboard, latestScores }: HomeProps) => {


  const { setTheme } = useWeb3ModalTheme()
  setTheme({ themeColor: 'green' });

  const { isConnected, address } = useAccount()
  const leaders = JSON.parse(leaderboard)
  const latestUsers = JSON.parse(latestScores)

  const [hasWalletPluginInstalled, setHasWalletPluginInstalled] = useState(true)
  const [manualAddressInput, setManualAddressInput] = useState('')

  return (
    <Page title="ETHRank - The Ethereum Leaderboard">

      <div className={styles.banner}>{bannerText}</div>
      <div className={`${styles.claimRow} ${styles.box}`}>
        <div className={styles.colOne}>
          <Image className={styles.badge} width={370} height={370} src="/s3_dynamic_badge.png" />
        </div>
        <div className={styles.colTwo}>
          <h3>Now Minting</h3>
          <h2>Season Three <strong>Dynamic Badges</strong></h2>
          <a href="https://mint.ethrank.io" className={btnStyles.btn}><strong>Claim</strong></a>
        </div></div>

      <div className={`${styles.home} content`}>

        <div className={`${styles.mainRow} ${styles.box}`}>

          <h1 className={styles.title}>
            Check your <strong>Ethereum blockchain score</strong> <em>instantly</em>
          </h1>

          <div className={`${btnStyles.connect} connect`}>
            {hasWalletPluginInstalled && <>
              {isConnected ?
                (
                  <a className={`${btnStyles.btn} ${styles.btn}`} href={`/address/${address}`}><strong>Check score now</strong></a>
                ) :
                <div className={btnStyles.btnWrapper}>
                  <Web3Button />
                </div>
              }
            </>}

            {hasWalletPluginInstalled && <div className={styles.manualOption}>
              or <a href="#nogo" onClick={() => {
                setHasWalletPluginInstalled(false);
              }}>input address manually</a>
            </div>}

            {!hasWalletPluginInstalled && <form onSubmit={async (e) => {
              e.preventDefault();
              if (manualAddressInput.toLowerCase().indexOf('.eth') > -1) {
                Router.push(`/ensName/${manualAddressInput}`)
              } else if (manualAddressInput.toLowerCase().indexOf('.') > -1) {
                Router.push(`/unstoppableName/${manualAddressInput.toLowerCase()}`)
              } else {
                Router.push(`/address/${manualAddressInput}`)
              }
            }} className={btnStyles.manualAddressInput}>

              <input type="text" value={manualAddressInput} placeholder={`Address or domain`} onChange={(e) => {
                setManualAddressInput(e.target.value);
              }} /> <button className={btnStyles.btn}><strong>Go</strong></button>

              <div className={btnStyles.tooltip}>
                <strong>examples</strong>
                <div className={btnStyles.supported}>
                  <ol>
                    <li>Public address: <span>0xd3be5d3fe342e...</span></li>
                    <li>Unstoppable Domains: <span>yourname.crypto</span></li>
                    <li>ENS: <span>yourname.eth</span></li>
                  </ol>
                </div>
              </div>
            </form>}
          </div>
        </div>

        <div className={styles.homeRow}>
          <div className={`${styles.leaderboard} ${styles.box}`}>
            <h2>Leaderboard</h2>
            <ol>
              {leaders.map((user: User, i: number) => {
                let displayName = user.address.substr(0, 10);
                if (user.name && user.name.length) {
                  displayName = user.name
                }
                return <li key={i}><a href={`/address/${user.address}`}>{displayName}</a><span>{user.score}</span></li>
              })}
            </ol>
          </div>
          <div className={`${styles.latestScores} ${styles.box}`}>
            <h2>Latest Scores</h2>
            <ol>
              {latestUsers.map((user: User, i: number) => {
                let displayName = user.address.substr(0, 10);
                if (user.name && user.name.length) {
                  displayName = user.name
                }
                return <li key={i}><a href={`/address/${user.address}`}>{displayName}</a><span>{user.score}</span></li>
              })}
            </ol>
          </div>
        </div>
        <div className={styles.adRow}>
          <span id="ct_cr9Bln7RW8u"></span>
        </div>
      </div>
    </Page>
  )
}

export default Home
