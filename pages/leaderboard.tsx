import styles from '../styles/Leaderboard.module.scss'
import Footer from '../components/Footer';
import prisma from '../lib/prisma';
import Header from '../components/Header';
import { User } from '../lib/User.interface';
import Head from 'next/head';
import Page from '../components/Page';


export async function getServerSideProps() {

  const leaderboard = await prisma.address.findMany({
    take: 100,
    where: {
      active: true
    },
    orderBy: {
      score: 'desc'
    }
  });

  return {
    props: {
      leaderboard: JSON.stringify(leaderboard)
    }
  }
}

interface LeaderboardParams {
  leaderboard: string
}

const Leaderboard = ({ leaderboard }: LeaderboardParams) => {
  const users = JSON.parse(leaderboard)
  return <Page title="ETHRank - Leaderboard">
    <div className="content">
      <div>
        <h3>Leaderboard</h3>
        <ol className={`${styles.cellParent} ${styles.achivements}`}>
          {users.map((user: User, i: number) => {
            let displayName = user.address;
            if (user.name && user.name.length) {
              displayName = user.name
            }
            return <li key={i} className={`${styles.user} user`}>
                <h4><a href={`/address/${user.address}`}>{displayName}</a></h4> 
              <span>{user.score}</span>
            </li>
          })}
        </ol>
      </div>
    </div>
  </Page>
}

export default Leaderboard