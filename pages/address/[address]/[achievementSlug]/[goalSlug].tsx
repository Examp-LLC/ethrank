

import { useRouter } from 'next/router'
import styles from '../../../../styles/Address.module.scss'
import goalStyles from '../../../../styles/Goal.module.scss'
import achievements from '../../../../lib/achievements.json';
import { AddressProps, getServerSideProps as getServerProps } from "../../[address]"
import ProgressBar from '../../../../components/ProgressBar';
import Footer from '../../../../components/Footer';
import Header from '../../../../components/Header';
import Score from '../../../../components/Score';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Page from '../../../../components/Page';

export async function getServerSideProps(context: NextPageContext) {
    return getServerProps(context);
}

const Goal = ({score, rank, progress, name}: AddressProps) => {

    const router = useRouter()
    const { address, achievementSlug, goalSlug } = router.query;

    const achievementIndex = achievements.findIndex((potentialMatch) => {
      return potentialMatch.slug === achievementSlug as string;
    })

    const achievement = achievements[achievementIndex];

    const goalIndex = achievement.goals.findIndex((potentialMatch) => {
      return potentialMatch.slug === goalSlug as string;
    })
    const goal = achievement.goals[goalIndex];

    const calculateProgress = function(i: number) {
      const results = progress.filter((item) => { 
        return item[0] === achievementIndex.toString() && item[1] === goalIndex.toString() && item[2] === i.toString()
      });
      if (results && results.length) {
        return results.length;
      } else return 0;
    };
    
    if (!name?.length) {
      name = undefined
    }

    return <Page title={`${address} - ETHRank`}>
      <div className="content">
        <div className={styles.address}>
          <h2 className="gradient-box gradient-bottom-only">{name || address}</h2>
        </div>
        <Score score={score} rank={rank} />
      <div>
        <ul className="breadcrumbs">
          <li><a href={`/address/${address}/`}>{address?.slice(undefined, 10)}</a></li>
          <li><a href={`/address/${address}/${achievement.slug}/`}>{achievement.name}</a></li>
          <li className="on">{goal.name}</li>
        </ul>
        <h3>{goal && goal.name}</h3>
        <div className={goalStyles.list}>
          {goal && goal.steps.map((step, i) => {
            return <div className={`${styles.step} animate__animated`} key={i}>
              <h4>{step.name}</h4>
              <ProgressBar percent={calculateProgress(i)/1} />
            </div>
          })}
          <div>
        </div>
        </div>
      </div>
      </div>
    </Page>
  }
  
  export default Goal