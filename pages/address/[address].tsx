import Router, { useRouter } from 'next/router'
import styles from '../../styles/Address.module.scss'
import achievements from '../../lib/achievements.json';
import Link from 'next/link';
import ProgressBar from '../../components/ProgressBar';
import prisma from '../../lib/prisma';
import Score from '../../components/Score';
import Web3 from 'web3';
import { useEffect } from 'react';
import { NextPageContext } from 'next';
import namehash from '@ensdomains/eth-ens-namehash';
import 'chart.js/auto';
import { Chart, Radar } from 'react-chartjs-2';
import { calculateScore } from '../../lib/calculateScore';
import Page from '../../components/Page';

export const convertToLowerCase = (input: string | Array<string> | undefined) => {
  if (typeof input === 'object') {
    return input.map(name => name.toLowerCase())
  } else if (typeof input === 'string') {
    return input.toLowerCase()
  }
}

export async function getServerSideProps(context: NextPageContext) {
  const { address, ud } = context.query;
  return await calculateScore(address, prisma, ud);
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
  address: string,
  score: number,
  rank: number,
  progress: Array<string>,
  error: boolean | string,
  name?: string
}

const Address = ({ address, score, rank, progress, error, name }: AddressProps) => {

  const router = useRouter()

  useEffect(() => {
    if (error) {
      router.push('/error');
    }
  });

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

  const categories = ['social', 'finance', 'collecting', 'technology'];

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
      backgroundColor: '#D9048E',
      borderColor: '#ffffff',
      pointBackgroundColor: '#D9048E',
      pointBorderColor: '#D9048E',
      pointHoverBackgroundColor: '#ffffff',
      pointHoverBorderColor: '#D9048E'
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
        <h2 className="gradient-box gradient-bottom-only">{name || address}</h2>
      </div>
      <Score score={score} rank={rank} />

      <div>
        <h3>Achievements</h3>
        <div className={`${styles.cellParent} ${styles.achivements}`}>
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
                <h4>{achievement.name}</h4>
                <ProgressBar percent={percentages / achievement.goals.length} />
              </div>
            </Link>
          })}
        </div>
      </div>

      <div className={styles.categoryRow}>
        <div className={styles.stats}>
          <h3>Stats</h3>
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
    </div>
  </Page>
}

export default Address