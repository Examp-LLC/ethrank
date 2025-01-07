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
import ParticlesBackground from '../components/ParticlesBackground'
import Link from 'next/link'

export async function getServerSideProps({ res }: NextPageContext) {

  if (res) {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=7200'
    )
  }

  const leaderboard = await prisma.address.findMany({
    take: 5,
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
    take: 5,
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
    `Season 5 has started!`,
    `Season 5: it has begun!`,
    `Now this is podracing!`,
    `Your journey starts here`,
    `Promoting creative and ambitious web3 projects`,
    `We support integrity, creativity, and transparency`,
    `Over 80 projects featured in Season 5!`,
    `Your destiny awaits`,
  ]
  return introText[Math.floor(Math.random() * introText.length)];
}


const Home = ({ leaderboard, latestScores }: HomeProps) => {


  const bannerText = getBannerText();

  // const { setTheme } = useWeb3ModalTheme()
  // setTheme({ themeColor: 'green' });
  const { open } = useWeb3Modal()

  const [hasWalletPluginInstalled, setHasWalletPluginInstalled] = useState(true)
  const [manualAddressInput, setManualAddressInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | undefined>('')
  const [isLoading, setIsLoading] = useState(false);

  const connectedWallet = useAccount()
  useEffect(() => {
    setIsConnected(connectedWallet.isConnected);
    setAddress(connectedWallet.address);
  })

  const leaders = JSON.parse(leaderboard)
  const latestUsers = JSON.parse(latestScores)

  return (
    <Page title="ETHRank - An open source achievement system and API for every Ethereum address">

      {/* <div className={styles.banner}>{bannerText}</div> */}
      <div className={`${styles.claimRow} ${styles.box}`}>
        <Dapp />
      </div>
      <div className={`${styles.home} content`}>

        <div className={`${styles.mainRow} ${styles.checkRow} greybox`}>
          <div className={`${styles.colOne}`}>
            <img src="/bg-gem.png" width={473} height={393} />
          </div>
          <div className={`${styles.colTwo}`}>

            <h1 className={styles.title}>
              Instantly check your<br /><strong>Ethereum blockchain score</strong>
            </h1>

            <div className={`${btnStyles.connect} ${styles.connect} connect`}>

              
              {hasWalletPluginInstalled && <div className={styles.btnWrapper}>
                {isConnected ?
                  (
                    <a className={`${btnStyles.btn} ${btnStyles.wide} ${styles.btn}`} href={`/address/${address}`}><strong>Check now</strong></a>
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
                if (!manualAddressInput.length) return;
                setIsLoading(true);
                if (manualAddressInput.toLowerCase().indexOf('.eth') > -1) {
                  await Router.push(`/ensName/${manualAddressInput}`)
                } else if (manualAddressInput.toLowerCase().indexOf('.') > -1) {
                  await Router.push(`/unstoppableName/${manualAddressInput.toLowerCase()}`)
                } else {
                  await Router.push(`/address/${manualAddressInput}`)
                }
                setIsLoading(false);
              }} className={btnStyles.manualAddressInput}>

                <input type="text" value={manualAddressInput} placeholder={`Address or domain`} onChange={(e) => {
                  setManualAddressInput(e.target.value);
                }} /> 
                <button className={`${btnStyles.btn} ${btnStyles.short}`} disabled={isLoading}>
                  <strong>Go</strong>
                </button>
                {isLoading && <span className={styles.spinner}></span>}

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
        </div>

        <div className={`${styles.leaderboard} ${styles.homeRow}`}>
          <h2>Leaderboard</h2>
          <div className={`${styles.box}`}>
            <ol>
              {leaders.map((user: User, i: number) => {
                let displayName = user.address.substr(0, 10);
                if (user.name && user.name.length) {
                  displayName = user.name
                }
                return <li key={i}><a href={`/address/${user.address}`}>{i === 0 && '🏆'}
                {i === 1 && '🥈'}
                {i === 2 && '🥉'} {displayName}</a><span>{user.score}</span></li>
              })}
            </ol>
          </div>
          <img src="/bg-trophy.png" width="500" height="500" alt="Trophy" />
        </div>

        <div className={`${styles.mainRow} ${styles.devOfferings} ${styles.homeRow} greybox`}>
          <div className={`${styles.box}`}>
            <h3>API / Developer Offerings</h3>
            <p>ETHRank offers two free APIs for public use: <strong>Address</strong> and <strong>Labels</strong>.
             With our APIs, you can build:</p>
            <ul>
              <li>Reputation systems: Leverage our achievements to gamify your audience.</li>
              <li>Identity solutions: Give your users a sense of identity and personalization to your app. </li>
              <li>Distribution mechanism: Token-gate project launches based on reputation or specific tokens.</li>
              <li>Loyalty programs: Reward your most loyal users and customers.</li>
            </ul>
            <Link href="/api-docs" className={`${btnStyles.btn} ${btnStyles.wide}`}><strong>API Documentation</strong></Link>
          </div>
        </div>

        <div className={`${styles.latestScores} ${styles.homeRow}`}>
          <h2>Latest Scores</h2>
          <div className={`${styles.box}`}>
            <ol>
              {latestUsers.map((user: User, i: number) => {
                let displayName = user.address.substr(0, 10);
                if (user.name && user.name.length) {
                  displayName = user.name
                }
                return <li key={i}><Link href={`/address/${user.address}`}>{displayName}</Link><span>{user.score}</span></li>
              })}
            </ol>
          </div>
          <img src="/bg-star.png" width="755" height="402" alt="Stars" />
        </div>
      </div>
    </Page>
  )
}

export default Home
