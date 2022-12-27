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

import type { NextPageContext } from 'next'
// import ConnectButtonOuter from '../components/ConnectButtonOuter'
import Page from '../components/Page'
import prisma from '../lib/prisma'
import { User } from '../lib/User.interface'
import styles from '../styles/Home.module.scss'
import btnStyles from '../styles/ConnectButton.module.scss'
import { CURRENT_SEASON } from '../lib/constants'
import Image from 'next/image'
import { ConnectButton, useAccount } from '@web3modal/react'

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

const Home = ({ leaderboard, latestScores }: HomeProps) => {

  const { isConnected, address } = useAccount()
  const leaders = JSON.parse(leaderboard)
  const latestUsers = JSON.parse(latestScores)

  return (
    <Page title="ETHRank - The Ethereum Leaderboard">
      <div className={styles.claimRow}>
        <div className={styles.colOne}>
          <Image width={246} height={246} src="/s2_dynamic_badge.png" />
        </div>
        <div className={styles.colTwo}>
          <h3>Now minting until Dec 31</h3>
          <h2>Claim your Season Two Dynamic Badge</h2>
          <a href="https://mint.ethrank.io" className={btnStyles.btn}><span>Claim</span></a>
        </div></div>

      <h1 className={styles.title}>
        Check your Ethereum blockchain score instantly
      </h1>

      <div className={`${styles.home} content`}>

        <div className={styles.mainRow}>
          {isConnected ? 
          (
            <a className={`${btnStyles.btn} ${styles.btn}`} href={`/address/${address}`}>Check score now</a>
          ) :
          <ConnectButton />
          }
        </div>

        <div className={styles.homeRow}>
          <div className={styles.leaderboard}>
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
          <div className={styles.leaderboard}>
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
