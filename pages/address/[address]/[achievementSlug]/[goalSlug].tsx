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
import styles from '../../../../styles/Address.module.scss'
import goalStyles from '../../../../styles/Goal.module.scss'
import { AddressProps, getServerSideProps as getServerProps } from "../../[address]"
import ProgressBar from '../../../../components/ProgressBar';
import Score from '../../../../components/Score';
import { NextPageContext } from 'next';
import Page from '../../../../components/Page';
import Link from 'next/link';
import { CURRENT_SEASON_ACHIEVEMENTS } from '../../../../lib/constants';
import {
  DetailMetric,
  DetailTags,
  StepDetails,
  getAddressCount,
  getAchievementCategories,
} from '../../../../components/AchievementDetails';

const achievements = CURRENT_SEASON_ACHIEVEMENTS;

export async function getServerSideProps(context: NextPageContext) {
  return getServerProps(context);
}

const Goal = ({ calcScoreResult, labels }: AddressProps) => {
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
  const { address, achievementSlug, goalSlug } = router.query;

  const achievementIndex = achievements.findIndex((potentialMatch) => {
    return potentialMatch.slug === achievementSlug as string;
  })

  const achievement = achievements[achievementIndex];

  if (!achievement) {
    return <Page title={`${address} - ETHRank`}>
      <div className="content">
        <p>Achievement not found.</p>
      </div>
    </Page>
  }

  const goalIndex = achievement.goals.findIndex((potentialMatch) => {
    return potentialMatch.slug === goalSlug as string;
  })
  const goal = achievement.goals[goalIndex];

  if (!goal) {
    return <Page title={`${address} - ETHRank`}>
      <div className="content">
        <p>Goal not found.</p>
      </div>
    </Page>
  }

  const calculateProgress = function (i: number) {
    const results = progress.filter((item) => {
      return item[0] === achievementIndex.toString() && item[1] === goalIndex.toString() && item[2] === i.toString()
    });
    if (results && results.length) {
      return results.length;
    } else return 0;
  };

  const completedSteps = goal.steps.reduce((sum, _, i) => sum + calculateProgress(i), 0);
  const eligibleAddressCount = getAddressCount(goal);

  return <Page title={`${address} - ETHRank`}>
    <div className="content">
      <div className={styles.address}>
        <h2 className="gradient-box gradient-bottom-only">{name?.length && name || address}</h2>
      </div>
      <Score score={score} rank={rank} />
      <div>
        <ul className="breadcrumbs">
          <li><a href={`/address/${address}/`}>{address?.slice(undefined, 10)}</a></li>
          <li><a href={`/address/${address}/${achievement.slug}/`}>{achievement.name}</a></li>
          <li className="on">{goal.name}</li>
        </ul>
        <h3>{goal && goal.name}</h3>
        <div className={`${styles.detailPanel} greybox`}>
          <div>
            <h4>Goal details</h4>
            <p>
              These steps are matched against the JSON scoring rules for {achievement.name}. Eligible token, contract, or wallet addresses are shown exactly as configured.
            </p>
          </div>
          <div className={styles.detailMetrics}>
            <DetailMetric label="Goal points" value={goal.points} />
            <DetailMetric label="Achievement points" value={achievement.points} />
            <DetailMetric label="Steps completed" value={`${completedSteps}/${goal.steps.length}`} />
            <DetailMetric label="Eligible addresses" value={eligibleAddressCount} />
          </div>
          <DetailTags tags={[goal.category].concat(getAchievementCategories(achievement).filter((category) => category !== goal.category))} />
        </div>
        <div className={goalStyles.list}>
          {goal && goal.steps.map((step, i) => {
            const percent = calculateProgress(i) / 1;
            return <div className={`${styles.achievement} greybox ${percent === 1 && styles.completed} animate__animated`} key={i}>
              <h4>{
                step.url && (
                  <a href={step.url} target="_blank" rel="noreferrer">{step.name}</a>
                ) || step.name
              }</h4>
              <StepDetails step={step} />
              <ProgressBar percent={percent} />
            </div>
          })}
          <div>
          </div>
        </div>

        <div className={styles.adRow}>
          <span id="ct_cr9Bln7RW8u"></span>
        </div>
      </div>
    </div>


  </Page>
}

export default Goal
