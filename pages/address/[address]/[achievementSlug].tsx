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


import { useRouter } from 'next/router'
import styles from '../../../styles/Address.module.scss'
import Link from 'next/link';
import { AddressProps, CalcScoreProps, getServerSideProps as getServerProps } from "../[address]"
import ProgressBar from '../../../components/ProgressBar';
import Score from '../../../components/Score';
import { NextPageContext } from 'next';
import Page from '../../../components/Page';
import { CURRENT_SEASON_ACHIEVEMENTS } from '../../../lib/constants';
import {
  DetailMetric,
  DetailTags,
  getAchievementCategories,
  getAchievementStepCount,
  getAddressCount,
} from '../../../components/AchievementDetails';

export async function getServerSideProps(context: NextPageContext) {
  return await getServerProps(context);
}


const achievements = CURRENT_SEASON_ACHIEVEMENTS;

const Achievement = ({ calcScoreResult, labels }: AddressProps) => {
  const router = useRouter()

  if (!calcScoreResult) {
    return (
      <Page title={`Loading - ETHRank`}>
        <div className="content">
          <p>Loading...</p>
        </div>
      </Page>
    );
  }

  const { score, rank, progress, name } = calcScoreResult;
  const { address, achievementSlug } = router.query;
  const achievementIndex = achievements.findIndex((potentialMatch) => {
    return potentialMatch.slug.toLowerCase() === achievementSlug && achievementSlug.toLowerCase();
  })

  const achievement = achievements[achievementIndex];

  const calculateProgress = function (i: number) {
    const results = progress.filter((item: string) => {
      return item[0] === achievementIndex.toString() && item[1] === i.toString() && item.length === 3
    });

    if (results && results.length) {
      return results.length;
    } else return 0;
  };

  if (!achievement) {
    return <Page title={`${address} - ETHRank`}>
      <div className="content">
        <p>Achievement not found.</p>
      </div>
    </Page>
  }

  const completedSteps = achievement.goals.reduce((sum, goal, i) => sum + calculateProgress(i), 0);
  const totalSteps = getAchievementStepCount(achievement);
  const categories = getAchievementCategories(achievement);

  return <Page title={`${address} - ETHRank`}>
    <div className="content">
      <div className={styles.address}>
        <h2 className="gradient-box gradient-bottom-only">{name?.length && name || address}</h2>
      </div>
      <Score score={score} rank={rank} />
      <div>
        <ul className="breadcrumbs">
          <li><a href={`/address/${address}/`}>{address?.slice(undefined, 10)}</a></li>
          <li className="on">{achievement.name}</li>
        </ul>
        <h3>{achievement && achievement.name}</h3>
        <div className={`${styles.detailPanel} greybox`}>
          <div>
            <h4>Achievement details</h4>
            <p>
              Complete the goals below to earn achievement points. Review each goal before taking action; token and contract-specific requirements are shown on the goal detail page.
            </p>
          </div>
          <div className={styles.detailMetrics}>
            <DetailMetric label="Achievement points" value={achievement.points} />
            <DetailMetric label="Goals" value={achievement.goals.length} />
            <DetailMetric label="Steps completed" value={`${completedSteps}/${totalSteps}`} />
          </div>
          <DetailTags tags={categories} />
        </div>
        <div className={styles.cellParent}>
          {achievement && achievement.goals.map((goal, i) => {
            const percent = calculateProgress(i) / goal.steps.length;
            const eligibleAddressCount = getAddressCount(goal);
            return <Link key={i} href={{
              pathname: '/address/[address]/[achievement]/[goal]',
              query: { address, achievement: achievement.slug, goal: goal.slug },
            }}>
              <div className={`${styles.achievement} ${percent === 1 && styles.completed} achievement greybox animate__animated`} key={i}>
                <h4>{goal.name}</h4>
                <div className={styles.cardMeta}>
                  <span>{goal.category}</span>
                  <span>{goal.points} points</span>
                  <span>{calculateProgress(i)}/{goal.steps.length} steps</span>
                  {eligibleAddressCount > 0 && <span>{eligibleAddressCount} eligible address{eligibleAddressCount === 1 ? '' : 'es'}</span>}
                </div>
                <ProgressBar percent={percent} />
              </div>
            </Link>
          })}
        </div>
      </div>
    </div>
  </Page>
}

export default Achievement
