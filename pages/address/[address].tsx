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


import { useRouter } from 'next/router';
import styles from '../../styles/Address.module.scss';
import Link from 'next/link';
import ProgressBar from '../../components/ProgressBar';
import prisma from '../../lib/prisma';
import Score from '../../components/Score';
import Web3 from 'web3';
import { useEffect, useState } from 'react';
import { NextPageContext } from 'next';
import namehash from '@ensdomains/eth-ens-namehash';
import 'chart.js/auto';
import { Chart, Radar } from 'react-chartjs-2';
import { CURRENT_SEASON, CURRENT_SEASON_ACHIEVEMENTS } from '../../lib/constants';
import Page from '../../components/Page';
import { getCalcMethod } from '../api/address/[address]';

function getCurrentSeasonColor() {
  switch (CURRENT_SEASON) {
    case 1:
      return '#D9048E';
    case 2:
      return '#05AFF2';
    case 3:
      return '#00EC26';
  }
}

const achievements =  CURRENT_SEASON_ACHIEVEMENTS;

export const SEASON_COLOR = getCurrentSeasonColor();

export const convertToLowerCase = (input: string | Array<string> | undefined) => {
  if (typeof input === 'object') {
    return input.map(name => name.toLowerCase())
  } else if (typeof input === 'string') {
    return input.toLowerCase()
  }
}

export async function getServerSideProps(context: NextPageContext) {
  const { address, ud } = context.query;
  if (!address || typeof address !== 'string' || !context.res) return;
  // cache for 12 hours, stale for additional 12
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=43200, stale-while-revalidate=86400'
  )
  let calcScore = getCalcMethod(CURRENT_SEASON.toString());
  return await calcScore(address, prisma, ud);
}

export async function reverseENSLookup(address: string, web3: Web3) {
  let lookup = address.toLowerCase().substr(2) + '.addr.reverse'
  let ResolverContract = await web3.eth.ens.getResolver(lookup);
  let nh = namehash.hash(lookup);
  try {
    let name = await ResolverContract.methods.name(nh).call();
    if (name && name.length) {
      const verifiedAddress = await web3.eth.ens.getAddress(name);
      if (verifiedAddress && verifiedAddress.toLowerCase() === address.toLowerCase()) {
        return name;
      }
    }
  } catch (e) { }
}

export interface AddressProps {
  address: string;
  score: number;
  rank: number;
  progress: Array<string>;
  error: boolean | string;
  name?: string;
  totalTransactions: string;
  spentOnGas: string;
  activeSince?: number;
  season?: number;
}

const Address = ({ address, score, rank, progress, error, name, totalTransactions, spentOnGas, activeSince }: AddressProps) => {

  const router = useRouter()

  useEffect(() => {
    if (error) {
      router.push('/error');
    }
  });

  const convertBigNumberToShorthand = (n: number) => {
      if (n < 1e3) return n % 1 != 0 ? n.toFixed(2) : n;
      if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
      if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
      if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
      if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
  };
  

  const calculateProgress = function (achievementIndex: number, i: number) {
    const results = progress.filter((item: string) => {
      return item[0] === achievementIndex.toString() && item[1] === i.toString() && item.length === 3
    });

    if (results && results.length) {
      return results.length;
    } else return 0;
  };

  // TODO: calculate using points rather than percentage completed, normalize against one another maybe
  const getPercentCategoryCompleted = function (category: string) {
    const percentCompleted = achievements
      .map((achievement, i) => {

        let numberOfGoalsInThisCategoryForThisAchievement = 0;
        const goalsInThisCategory = achievement.goals
          .map((goal, j) => {
            const percent = progress.filter((item: string) => {
              return item[0] === i.toString() && item[1] === j.toString() && item.length === 3
            }).length / achievement.goals.length
            return {
              category: goal.category,
              percent
            }
          })
          .filter((goal) => {
            return goal.category === category
          });
        const percentDoneInThisAchievement = goalsInThisCategory.reduce((prev, { percent }) => {
          return prev + percent
        }, 0);
        numberOfGoalsInThisCategoryForThisAchievement += goalsInThisCategory.length;
        return {
          numberOfGoalsInThisCategoryForThisAchievement,
          percentCompleted: percentDoneInThisAchievement || 0
        };
      })
      .reduce((prev, achievement) => {
        return {
          percentCompleted: prev.percentCompleted + achievement.percentCompleted,
          numberOfGoalsInThisCategoryForThisAchievement: prev.numberOfGoalsInThisCategoryForThisAchievement + achievement.numberOfGoalsInThisCategoryForThisAchievement
        }
      }, {
        percentCompleted: 0,
        numberOfGoalsInThisCategoryForThisAchievement: 0
      })

    return percentCompleted.percentCompleted / percentCompleted.numberOfGoalsInThisCategoryForThisAchievement
  }

  if (!name?.length) {
    name = undefined
  }

  const categories = ['reputation', 'nfts', 'defi', 'staking'];

  const categoryData = categories.map((category, i) => {
    const percentCompleted = getPercentCategoryCompleted(category);
    return {
      category,
      percentCompleted
    }
  });

  const data = {
    labels: categories.map(category => category.toUpperCase()),
    datasets: [{
      data: categoryData.map((data) => {
        return data.percentCompleted * 100
      }),
      fill: true,
      backgroundColor: SEASON_COLOR,
      borderColor: '#FFD701',
      pointBackgroundColor: SEASON_COLOR,
      pointBorderColor: SEASON_COLOR,
      pointHoverBackgroundColor: '#FFD701',
      pointHoverBorderColor: SEASON_COLOR
    }]
  };

  const config = {
    type: 'radar',
    data: data,
    scales: {
      r: {
        // suggestedMin: 0,
        // suggestedMax: 100,
        ticks: {
          stepSize: 20,
          showLabelBackdrop: false
        },
        angleLines: {
          color: "rgba(255, 255, 255, 1)",
          lineWidth: 1
        },
        gridLines: {
          color: "rgba(255, 255, 255, 1)",
          circular: true
        },
        grid: {
          borderColor: 'rgba(255, 255, 255, .25)',
          backgroundColor: 'rgba(255, 255, 255, .25)',
          color: 'rgba(255, 255, 255, .25)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };


  return <Page title={`${address} - ETHRank`}>
    <div className="content">
      <div className={styles.address}>
        <h2 className="gradient-box gradient-bottom-only">
          {name || address}
        </h2>
      </div>
      <Score score={score} rank={rank} />

      <div>
        <h3>Achievements <span className="pill">Season {CURRENT_SEASON}</span></h3>
        <div className={`${styles.cellParent} ${styles.achievements}`}>
          {achievements.map((achievement, i) => {
            const goals = achievement.goals;
            const percentages = goals.map((goal, j) => {
              return calculateProgress(i, j) / goal.steps.length
            }).reduce((partial_sum, a) => partial_sum + a, 0)
            return <Link key={i} href={{
              pathname: '/address/[address]/[achievement]',
              query: { address, achievement: achievement.slug },
            }}>
              <div className={`${styles.achievement} achievement animate__animated`}>
                <h4><Link href={{
              pathname: '/address/[address]/[achievement]',
              query: { address, achievement: achievement.slug },
            }}>{achievement.name}</Link></h4>
                {/* <h2>{(percentages / achievement.goals.length * 100).toFixed(0)} %</h2> */}
                <ProgressBar percent={percentages / achievement.goals.length} />
              </div>
            </Link>
          })}
        </div>
      </div>

      <div className={styles.categoryRow}>
        <div className={styles.categoriesWrapper}>
          <h3>Categories <span className="pill">Season {CURRENT_SEASON}</span></h3>
          <div className={styles.categories}>
            {categoryData.map((category, i) => {
              return <div
                key={i}
                className={`${styles.category}`}>
                <h4>{category.category}</h4>
                <ProgressBar percent={category.percentCompleted} />
              </div>
            })}
          </div>
        </div>
        <div className={styles.radar}>
          <Radar data={data} options={config} />
        </div>
      </div>

      <div className={styles.statsWrapper}>
        <img width="103" height="32" src="/logo-sm.png" className={styles.statsLogo} alt="ethrank.io" />
        <h3>Statistics <span className="pill lifetime">Lifetime</span></h3>
        <div className={`${styles.cellParent} ${styles.stats}`}>
          <div className={`${styles.stat} stat`}>
              <h4>Transactions</h4>
              <h2>{convertBigNumberToShorthand(parseFloat(totalTransactions))}</h2>
          </div>
          <div className={`${styles.stat} stat`}>
              <h4>Spent on Gas</h4>
              <h2>Ξ{convertBigNumberToShorthand(parseFloat(spentOnGas))}</h2>
          </div>
          <div className={`${styles.stat} stat`}>
              <h4>Active Since</h4>
              <h2>{activeSince ? new Date(activeSince).getFullYear() : 'Unknown'}</h2>
          </div>
        </div>
      </div>
    </div>
  </Page>
}

export default Address