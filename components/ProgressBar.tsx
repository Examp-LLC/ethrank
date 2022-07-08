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
import styles from '../styles/ProgressBar.module.css';

interface ProgressBarProps {
  percent: number
}

const ProgressBar = ({
  percent
}: ProgressBarProps) => (
  <div className={styles.outer}>
    <div style={{ width: `${100 - (percent * 100)}%` }} className={styles.inner}></div>
  </div>
)
ProgressBar.propTypes = {
  percent: PropTypes.number.isRequired
};
export default ProgressBar;