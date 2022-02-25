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