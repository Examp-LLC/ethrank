import type { NextPage } from 'next'
import Head from 'next/head'
import { ReactNode } from 'react'
import ConnectButtonProvider from '../components/ConnectButtonProvider'
import Footer from '../components/Footer'
import Header from '../components/Header'
import styles from '../styles/Home.module.scss'

// add to this every new season
export const seasons = [
  'achievements_season1',
  'achievements_season2'
];

interface PageProps {
  children: ReactNode,
  title: string
}

const Page = (props: PageProps) => {

  return (
    <ConnectButtonProvider>
      <div className={styles.container}>
        <Head>
          <title>{props.title}</title>
          <meta name="description" content="ETHRank - An achievement system built on the Ethereum blockchain." />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header />

        <main className={styles.main}>
          {props.children}
        </main>

        <Footer />
      </div>
    </ConnectButtonProvider>
  )
}

export default Page
