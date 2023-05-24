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