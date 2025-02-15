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


import Router, { useRouter } from 'next/router'
import styles from '../../styles/Address.module.scss'
import season1Achievements from '../../lib/achievements_season1.json';
import season2Achievements from '../../lib/achievements_season2.json';
import season3Achievements from '../../lib/achievements_season3.json';
import season4Achievements from '../../lib/achievements_season4.json';
import season5Achievements from '../../lib/achievements_season5.json';
import Link from 'next/link';
import ProgressBar from '../../components/ProgressBar';
import prisma from '../../lib/prisma';
import { useEffect } from 'react';
import { NextPageContext } from 'next';
import Page, { SEASONS } from '../../components/Page';
import { CalcScoreProps } from '../address/[address]';
import { Address } from '@prisma/client';
import truncateEthAddress from 'truncate-eth-address';

const achievements = [
  season1Achievements,
  season2Achievements,
  season3Achievements,
  season4Achievements,
  season5Achievements,
];

export const convertToLowerCase = (input: string | Array<string> | undefined) => {
  if (typeof input === 'object') {
    return input.map(name => name.toLowerCase())
  } else if (typeof input === 'string') {
    return input.toLowerCase()
  }
}

export interface VaultProps {
  scores: Array<CalcScoreProps>;
  address: string;
  error: boolean;
}

export async function getServerSideProps(context: NextPageContext) {
  const error = false;
  const { address } = context.query;
  const allSeasonScores = await prisma.address.findMany({
    where: {
      address: {
        equals: convertToLowerCase(address),
      }
    },
    orderBy: {
      season: 'asc',
    }
  });

  let scores = [];

  if (allSeasonScores) {
    scores = await Promise.all(
      allSeasonScores.map(async ({ progress, score, name, season }: Address) => { 
        const rank = await prisma.address.count({
          where: {
            AND: {
              score: {
                gte: score,
              },
              season
            }
          },
        });
        return {
          progress: JSON.parse(progress), 
          score, 
          rank, 
          name,
          season
        }
     })
    )
  }

  return {
    props: {
      address,
      scores,
      error
    }
  }
}

const Vault = ({ address, scores, error }: VaultProps) => {

  const router = useRouter()

  useEffect(() => {
    if (error) {
      router.push('/error');
    }
  });

  const calculateProgress = function (progress: string[], achievementIndex: number, i: number) {
    const results = progress.filter((item: string) => {
      return item[0] === achievementIndex.toString() && item[1] === i.toString() && item.length === 3
    });

    if (results && results.length) {
      return results.length;
    } else return 0;
  };

  const getAchievementsForSeason = (seasonIndex: number, progress: string[]) => {
    return achievements[seasonIndex].map((achievement, i) => {
      const goals = achievement.goals;
      const percentages = goals.map((goal, j) => {
        return calculateProgress(progress, i, j) / goal.steps.length
      }).reduce((partial_sum, a) => partial_sum + a, 0)
      return <div key={i} className={`${styles.achievement} achievement animate__animated`}>
          <h4>{achievement.name}</h4>
          <ProgressBar percent={percentages / achievement.goals.length} />
        </div>
    })
  }

  const getScoreForSeason = (seasonIndex: number) => {
    return scores[seasonIndex].score;
  }

  const getRankForSeason = (seasonIndex: number) => {
    return scores[seasonIndex].rank;
  }

  const getSeasonByNumber = (humanReadableSeasonNumber: number) => {
    return scores.find(({season}) => season === humanReadableSeasonNumber);
  }

  const name = scores[scores.length-1]?.name;

  return <Page title={`${address} - ETHRank`}>
    <div className="content">
      <div className={styles.address}>
        <h2 className="gradient-box gradient-bottom-only">{name || truncateEthAddress(address)}</h2>
      </div>

      <div className={styles.vault}>
        <h1>Vault</h1>
        {SEASONS.map((season, i) => {
          const humanReadableSeasonNumber = i+1;
          const scoreForSeason = getSeasonByNumber(humanReadableSeasonNumber);
          if (scoreForSeason) {
            return (
              <div className={styles.season} key={i}>
                <div className={styles.seasonHeader}>
                  <h3>Season {scoreForSeason.season}</h3>
                  <h4>Score <label>{scoreForSeason.score}</label></h4>
                  <h4>Rank <label>{scoreForSeason.rank}</label></h4>
                </div>
                <div className={`${styles.cellParent} ${styles.achievements}`}>
                  {getAchievementsForSeason(i, scoreForSeason.progress)}
                </div>
              </div>
            );
          } else {
            return (
              <div className={styles.season} key={i}>
                <div className={styles.seasonHeader}>
                  <h3>Season {humanReadableSeasonNumber}</h3>
                  <h4></h4>
                  <h4>Ended</h4>
                </div>
              </div>
            )
          }
        }).reverse()}
      </div>
    </div>
  </Page>
}

export default Vault