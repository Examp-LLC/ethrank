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

import styles from '../styles/Leaderboard.module.scss'
import prisma from '../lib/prisma';
import { User } from '../lib/User.interface';
import Page from '../components/Page';
import { CURRENT_SEASON } from '../lib/constants';
import { NextPageContext } from 'next';


export async function getServerSideProps({ res }: NextPageContext) {

  if (res) {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=7200'
    )
  }

  const leaderboard = await prisma.address.findMany({
    take: 100,
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
        <h3>Season {CURRENT_SEASON} Leaderboard</h3>
        <ol className={`${styles.cellParent} ${styles.achievements}`}>
          {users.map((user: User, i: number) => {
            let displayName = user.address;
            if (user.name && user.name.length) {
              displayName = user.name
            }
            return <li key={i} className={`${styles.user} user`}>
                <h4><a href={`/address/${user.address}`}>
                {i === 0 && '🏆'}
                {i === 1 && '🥈'}
                {i === 2 && '🥉'} {displayName}
                </a></h4> 
              <span>{user.score}</span>
            </li>
          })}
        </ol>
      </div>
    </div>
  </Page>
}

export default Leaderboard