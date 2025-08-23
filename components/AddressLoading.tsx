import { useState, useEffect } from 'react';
import styles from '../styles/Address.module.scss';
import ProgressBar from './ProgressBar';
import { Badge } from './season-five/Badge';
import ParticlesBackground from './ParticlesBackground';
import truncateEthAddress from 'truncate-eth-address';
import Link from 'next/link';

interface AddressLoadingProps {
  address: string;
  name?: string;
}

const AddressLoading = ({ address, name }: AddressLoadingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    { text: 'Fetching data from Mainnet...', duration: 2000 },
    { text: 'Fetching data from Base...', duration: 1500 },
    { text: 'Fetching data from Polygon...', duration: 1500 },
    { text: 'Calculating Score...', duration: 2500 },
    { text: 'Calculating Achievements...', duration: 2000 },
    { text: 'Finalizing Results...', duration: 1000 }
  ];

  useEffect(() => {
    let currentProgress = 0;
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    
    loadingSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        currentProgress += (step.duration / totalDuration) * 100;
        setProgress(currentProgress);
      }, loadingSteps.slice(0, index).reduce((sum, s) => sum + s.duration, 0));
    });
  }, []);

  // Generate fake progress data for the badge
  const fakeProgress = [
    '0,0,1', '0,1,1', '0,2,1',
    '1,0,1', '1,1,1', '1,2,1',
    '2,0,1', '2,1,1', '2,2,1',
    '3,0,1', '3,1,1', '3,2,1'
  ];

  const displayAddress = name?.length ? name : truncateEthAddress(address);

  return (
    <div className="content">
      <div className={styles.categoryRow}>
        <div className={styles.colOne}>
          <div className={styles.badgeContainer}>
            <Badge address={displayAddress} score={0} rank={0} progress={fakeProgress} />
            <ParticlesBackground />
            <video src="/bg-video3-optimized.mp4" autoPlay playsInline muted loop />
          </div>
        </div>

        <div className={styles.colTwo}>
          <h1>{displayAddress}</h1>
          
          <div className={styles.loadingStatus}>
            <div className={styles.loadingStep}>
              <h4>Calculating your ETHRank...</h4>
              <p>{loadingSteps[currentStep]?.text || 'Processing...'}</p>
              <ProgressBar percent={progress / 100} />
            </div>
          </div>

          <div className={styles.categories}>
            {['reputation', 'nfts', 'defi', 'staking'].map((category, i) => (
              <div key={i} className={`${styles.category}`}>
                <h4>{category}</h4>
                <ProgressBar percent={0} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`${styles.cellParent} ${styles.claimRow}`}>
        <div className={`${styles.claimCell} greybox`}>
          <img src="/bg-arrow-up.png" width="90" height="60" className={styles.claimArrow} />
          <h2>Claim your dynamic badge</h2>
          <ul className={styles.claimBox}>
            <li>Evolves with you</li>
            <li>ERC-721 on mainnet</li>
            <li><span className={styles.oldPrice}>Ξ0.1</span> Ξ0.05
              <span className={styles.sale}>SALE</span>
            </li>
          </ul>
          <div><Link href="/" className={styles.btn}><strong>Claim Badge</strong></Link></div>
        </div>
        <div className={`${styles.claimCell} greybox`}>
          <div>
            <h2>Attest your score</h2>
            <p>Using the Ethereum Attestation Service (EAS) on <span className={styles.red}>Optimism</span></p>
          </div>
          <p>Score calculation in progress...</p>
        </div>
      </div>

      <div>
        <h3>Achievements <span className="pill">Season V</span></h3>
        <div className={`${styles.cellParent} ${styles.achievements}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`${styles.achievement} greybox achievement animate__animated`}>
              <h4>Loading...</h4>
              <ProgressBar percent={0} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.statsWrapper}>
        <img width="114" height="41" src="/ethrank_logo_sm.png" className={styles.statsLogo} alt="ethrank.io" />
        <h3>Statistics <span className="pill lifetime">Lifetime</span></h3>
        <div className={`${styles.cellParent} ${styles.stats}`}>
          <div className={`${styles.stat} stat greybox`}>
            <h4>Rank</h4>
            <h2>...</h2>
          </div>
          <div className={`${styles.stat} stat greybox`}>
            <h4>Transactions</h4>
            <h2>...</h2>
          </div>
          <div className={`${styles.stat} stat greybox`}>
            <h4>Active Since</h4>
            <h2>...</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressLoading;
