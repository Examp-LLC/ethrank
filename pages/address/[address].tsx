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


import { useRouter } from 'next/router';
import styles from '../../styles/Address.module.scss';
// import btnStyles from '../../styles/ConnectButton.module.scss';
import Link from 'next/link';
import ProgressBar from '../../components/ProgressBar';
import prisma from '../../lib/prisma';
import { useEffect, useState } from 'react';
import { NextPageContext } from 'next';
import { CURRENT_SEASON, CURRENT_SEASON_ACHIEVEMENTS, CURRENT_SEASON_BADGE_ACHIEVEMENT_INDEX } from '../../lib/constants';
import Page from '../../components/Page';
import { getCalcMethod } from '../api/address/[address]';
import { getLabelsForAddress } from '../api/labels/[address]';
import { Goal } from '../../lib/Achievement.interface';
import { Badge } from '../../components/season-four/Badge';
import truncateEthAddress from 'truncate-eth-address';
import { useAccount } from 'wagmi';
import btnStyles from '../../styles/ConnectButton.module.scss';

const achievements = CURRENT_SEASON_ACHIEVEMENTS;

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
  const score = await calcScore(address, prisma, ud);
  let labels = await getLabelsForAddress(address);
  return {
    props: {
      calcScoreResult: score.props,
      error: score.props.error,
      labels
    }
  }
}

export interface CalcScoreProps {
  address: string;
  score: number;
  rank: number;
  progress: Array<string>;
  name: string;
  totalTransactions: string;
  spentOnGas: string;
  activeSince?: number;
  season?: number;
}

export interface AddressProps {
  calcScoreResult: CalcScoreProps;
  labels: Goal[];
  error: boolean | string;
}

const Address = ({ calcScoreResult, labels, error }: AddressProps) => {

  const { address, score, rank, progress, name, totalTransactions, spentOnGas, activeSince } = calcScoreResult;

  const router = useRouter()

  const [ownsNFT, setOwnsNFT] = useState(false);

  const connectedWallet = useAccount();

  // @ts-ignore
  useEffect(async () => {
    if (error) {
      router.push('/error');
    }

    const connectedUserScoreAndRankRequest = await fetch(`/api/address/${connectedWallet.address}?${new Date().getTime()}`);
    if (connectedUserScoreAndRankRequest.ok) {
      const connectedUserETHRank = await connectedUserScoreAndRankRequest.json();
      if (connectedUserETHRank.progress.indexOf(CURRENT_SEASON_BADGE_ACHIEVEMENT_INDEX) > -1) {
        setOwnsNFT(true);
      }
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

  const getLabelIcon = (category: string) => {
    switch (category) {
      case 'reputation':
      case 'social':
        return '/users-solid.svg'
      case 'nfts':
      case 'collecting':
        return '/gem-solid.svg';
      case 'technology':
      case 'staking':
        return '/microchip-solid.svg'
      case 'defi':
      case 'finance':
        return '/coins-solid.svg'
    }
  }

  const categories = ['reputation', 'nfts', 'defi', 'staking'];

  const categoryData = categories.map((category, i) => {
    const percentCompleted = getPercentCategoryCompleted(category);
    return {
      category,
      percentCompleted
    }
  });

  let displayAddress = name?.length && name || truncateEthAddress(address)

  return <Page title={`${address} - ETHRank`}>
    <div className="content">
      <div className={styles.address}>
        <h1>
          {displayAddress}
        </h1>
      </div>

      <div className={styles.categoryRow}>
        <div className={styles.colOne}>
          <div className={styles.badge}>
            <Badge address={displayAddress} score={score} rank={rank} progress={progress} />
          </div>
        </div>

        <div className={styles.colTwo}>
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
      </div>

      <div>
        <h3>Achievements <span className="pill">Season IV</span></h3>
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

      <div className={styles.statsWrapper}>
        <img width="103" height="32" src="/logo-sm.png" className={styles.statsLogo} alt="ethrank.io" />
        <h3>Statistics <span className="pill lifetime">Lifetime</span></h3>
        {ownsNFT ?
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
          :
          <div className={`${styles.cellParent} ${styles.stats}`}>
            <div className={`${styles.stat} stat`}>
                <h4>Transactions</h4>
                <h2>1023</h2>
              </div>
              <div className={`${styles.stat} stat`}>
                <h4>Spent on Gas</h4>
                <h2>Ξ12.2</h2>
              </div>
              <div className={`${styles.stat} stat`}>
                <h4>Active Since</h4>
                <h2>2015</h2>
              </div>
              <div className={styles.cta}>
                <h2>Dynamic Badge required to view stats</h2>
                <Link href="/" className={btnStyles.btn}><strong>Claim your badge now</strong></Link>
              </div>
          </div>
        }

      </div>

      <div className={styles.labelsWrapper}>
        <h3>Labels <span className="pill lifetime">Lifetime</span></h3>

        {ownsNFT ?
        <ul className={`${styles.cellParent} ${styles.labels}`}>
          {labels.filter(({ name }, index) => {
            return index === labels.findIndex((goal) => goal.name === name)
          }).map((goal, i) => {
            return (
              <li className={`${styles.stat} ${styles[goal.category]} label`} key={i}>
                <img src={getLabelIcon(goal.category)} />
                <label>{goal.name}</label>
              </li>
            )
          })}
        </ul>
          :
          <div className={`${styles.cellParent} ${styles.labels}`}>
            <ul>
                <li className={`${styles.stat} users label`}>
                  <img src='/users-solid.svg' />
                  <label>Lorem Ipsum Dolor Set</label>
                </li>
                <li className={`${styles.stat} users label`}>
                  <img src='/users-solid.svg' />
                  <label>If you are reading this</label>
                </li>
                <li className={`${styles.stat} users label`}>
                  <img src='/gem-solid.svg' />
                  <label>Please buy a badge</label>
                </li>
                <li className={`${styles.stat} users label`}>
                  <img src='/microchip-solid.svg' />
                  <label>Or reach out for some work</label>
                </li>
                <li className={`${styles.stat} users label`}>
                  <img src='/users-solid.svg' />
                  <label>Lorem Ipsum Dolor Set</label>
                </li>
                <li className={`${styles.stat} users label`}>
                  <img src='/users-solid.svg' />
                  <label>If you are reading this</label>
                </li>
                <li className={`${styles.stat} users label`}>
                  <img src='/gem-solid.svg' />
                  <label>Please buy a badge</label>
                </li>
                <li className={`${styles.stat} users label`}>
                  <img src='/microchip-solid.svg' />
                  <label>Or reach out for some work</label>
                </li>
            </ul>
            <div className={styles.cta}>
              <h2>Dynamic Badge required to view labels</h2>
              <Link href="/" className={btnStyles.btn}><strong>Claim your badge now</strong></Link>
            </div>
          </div>
        }
      </div>

      {/* <div className={styles.adRow}>
        <span id="ct_cr9Bln7RW8u"></span>
        <span id="ct_cGXDS2tunjH"></span>
      </div> */}
    </div>
  </Page>
}

export default Address