import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/Score.module.scss';

interface ScoreProps {
  score: number,
  rank: number
}

const Score = ({
  score, rank
}: ScoreProps) => (
  <div className={styles.score}>
    <div>
      <h3>{score}</h3>
      <h5>Score</h5>
    </div>
    <div>
      <h3>
        {rank} 
        {rank === 1 && '🏆'}
        {rank === 2 && '🥈'}
        {rank === 3 && '🥉'}
      </h3>
      <h5>ΞRank</h5>
    </div>
  </div>
)
Score.propTypes = {
  score: PropTypes.number.isRequired,
  rank: PropTypes.number.isRequired
};
export default Score;