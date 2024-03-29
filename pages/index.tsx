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

import type { NextPageContext } from 'next'
// import ConnectButtonOuter from '../components/ConnectButtonOuter'
import Page from '../components/Page'
import prisma from '../lib/prisma'
import { User } from '../lib/User.interface'
import styles from '../styles/Home.module.scss'
import btnStyles from '../styles/ConnectButton.module.scss'
import { CURRENT_SEASON } from '../lib/constants'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Router from 'next/router'
import { useAccount } from 'wagmi';
// import { useWeb3ModalTheme, Web3Button } from '@web3modal/react'
import Dapp from '../components/Dapp'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export async function getServerSideProps({ res }: NextPageContext) {

  if (res) {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=7200'
    )
  }

  const leaderboard = await prisma.address.findMany({
    take: 6,
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
    take: 6,
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
    'Created by @blankey1337',
    `What's your ETHRank?`,
    `Season 4 has started!`,
    `Season 4: it has begun!`,
    `Now this is podracing!`,
    `Your journey starts here`,
    `Promoting creative and ambitious web3 projects`,
    `We support integrity, creativity, and transparency`,
    `Over 80 projects featured in Season 4!`,
    `Your destiny awaits`,
  ]
  return introText[Math.floor(Math.random() * introText.length)];
}

const bannerText = getBannerText();

const Home = ({ leaderboard, latestScores }: HomeProps) => {


  // const { setTheme } = useWeb3ModalTheme()
  // setTheme({ themeColor: 'green' });
  const { open } = useWeb3Modal()

  const [hasWalletPluginInstalled, setHasWalletPluginInstalled] = useState(true)
  const [manualAddressInput, setManualAddressInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | undefined>('')

  const connectedWallet = useAccount()
  useEffect(() => {
    setIsConnected(connectedWallet.isConnected);
    setAddress(connectedWallet.address);
  })

  const leaders = JSON.parse(leaderboard)
  const latestUsers = JSON.parse(latestScores)

  return (
    <Page title="ETHRank - An open source achievement system and API for every Ethereum address">

      <div className={styles.banner}>{bannerText}</div>
      <div className={`${styles.claimRow} ${styles.box}`}>
        <Dapp />
      </div>
      <div className={`${styles.home} content`}>

        <div className={`${styles.mainRow} ${styles.box}`}>

          <h1 className={styles.title}>
            Check your <strong>Ethereum blockchain score</strong> <em>instantly</em>
          </h1>

          <div className={`${btnStyles.connect} ${styles.connect} connect`}>

            
            {hasWalletPluginInstalled && <div className={styles.btnWrapper}>
              {isConnected ?
                (
                  <a className={`${btnStyles.btn} ${styles.btn}`} href={`/address/${address}`}><strong>Check score now</strong></a>
                ) :
                  <button className={btnStyles.btn} onClick={() => open()}><strong>Connect</strong></button>
                }
                </div>}
            

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
      </div>
    </Page>
  )
}

export default Home
