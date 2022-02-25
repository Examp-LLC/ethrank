import type { NextPage } from 'next'
import Head from 'next/head'
import ConnectButton from '../components/ConnectButtonProvider'
import ConnectButtonOuter from '../components/ConnectButtonOuter'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Page from '../components/Page'
import prisma from '../lib/prisma'
import { User } from '../lib/User.interface'
import styles from '../styles/Home.module.scss'

export async function getServerSideProps() {

  const leaderboard = await prisma.address.findMany({
    take: 4,
    where: {
      active: true
    },
    orderBy: {
      score: 'desc'
    }
  });
  const latestScores = await prisma.address.findMany({
    take: 4,
    where: {
      active: true
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

const Home = ({leaderboard, latestScores}: HomeProps) => {

  const leaders = JSON.parse(leaderboard)
  const latestUsers = JSON.parse(latestScores)

  return (
    <Page title="ETHRank - An achivement system built on the Ethereum blockchain">
        <h1 className={styles.title}>
          Check your Ethereum blockchain score instantly
        </h1>

        <div className={`${styles.home} content`}>
        
        <ConnectButtonOuter /> 

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
