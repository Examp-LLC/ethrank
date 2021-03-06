/*
 * All content copyright 2022 Examp, LLC
 *
 * This file is part of some open source application.
 * 
 * Some open source application is free software: you can redistribute 
 * it and/or modify it under the terms of the GNU General Public 
 * License as published by the Free Software Foundation, either 
 * version 3 of the License, or (at your option) any later version.
 * 
 * Some open source application is distributed in the hope that it will 
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
        {rank === 1 && '๐'}
        {rank === 2 && '๐ฅ'}
        {rank === 3 && '๐ฅ'}
      </h3>
      <h5>ฮRank</h5>
    </div>
  </div>
)
Score.propTypes = {
  score: PropTypes.number.isRequired,
  rank: PropTypes.number.isRequired
};
export default Score;