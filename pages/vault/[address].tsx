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


import Router, { useRouter } from 'next/router'
import styles from '../../styles/Address.module.scss'
import season1Achievements from '../../lib/achievements_season1.json';
import season2Achievements from '../../lib/achievements_season2.json';
import Link from 'next/link';
import ProgressBar from '../../components/ProgressBar';
import prisma from '../../lib/prisma';
import { useEffect } from 'react';
import { NextPageContext } from 'next';
import Page, { SEASONS } from '../../components/Page';
import { AddressProps } from '../address/[address]';
import { Address } from '@prisma/client';

const achievements = [
  season1Achievements,
  season2Achievements
];

export const convertToLowerCase = (input: string | Array<string> | undefined) => {
  if (typeof input === 'object') {
    return input.map(name => name.toLowerCase())
  } else if (typeof input === 'string') {
    return input.toLowerCase()
  }
}

export interface VaultProps {
  scores: Array<AddressProps>;
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
    // filter out multiple records for the same season (can happen, its a bug, thx planetscale)
    const seasons: boolean[] = [];
    const scoresForEachSeason = allSeasonScores.filter(({ season }: Address) => {
      const isDupe = seasons[season];
      seasons[season] = true;
      return !isDupe;
    });
    scores = await Promise.all(
      scoresForEachSeason.map(async ({ progress, score, name, season }: Address) => { 
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
          name 
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

  const calculateProgress = function (seasonIndex: number, achievementIndex: number, i: number) {
    const progress = scores[seasonIndex].progress;
    const results = progress.filter((item: string) => {
      return item[0] === achievementIndex.toString() && item[1] === i.toString() && item.length === 3
    });

    if (results && results.length) {
      return results.length;
    } else return 0;
  };

  const getAchievementsForSeason = (seasonIndex: number) => {
    return achievements[seasonIndex].map((achievement, i) => {
      const goals = achievement.goals;
      const percentages = goals.map((goal, j) => {
        return calculateProgress(seasonIndex, i, j) / goal.steps.length
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

  const seasonExists = (seasonIndex: number) => {
    return !!scores[seasonIndex];
  }

  const name = scores[scores.length-1]?.name;

  return <Page title={`${address} - ETHRank`}>
    <div className="content">
      <div className={styles.address}>
        <h2 className="gradient-box gradient-bottom-only">{name || address}</h2>
      </div>

      <div className={styles.vault}>
        <h1>Vault</h1>
        {SEASONS.map((season, i) => {
          const humanReadableSeasonNumber = i+1;
          if (seasonExists(i)) {
            return (
              <div className={styles.season} key={i}>
                <div className={styles.seasonHeader}>
                  <h3>Season {humanReadableSeasonNumber}</h3>
                  <h4>Score <label>{getScoreForSeason(i)}</label></h4>
                  <h4>Rank <label>{getRankForSeason(i)}</label></h4>
                </div>
                <div className={`${styles.cellParent} ${styles.achievements}`}>
                  {getAchievementsForSeason(i)}
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