import { BigNumber, utils } from 'ethers';
import React from 'react';
import NetworkConfigInterface from '../../smart-contract/lib/NetworkConfigInterface';
import styles from '../styles/Home.module.scss';
import btnStyles from '../styles/ConnectButton.module.scss';

interface Props {
  networkConfig: NetworkConfigInterface;
  tokenPrice: BigNumber;
  maxMintAmountPerTx: number;
  isPaused: boolean;
  isWhitelistMintEnabled: boolean;
  isUserInWhitelist: boolean;
  mintTokens(mintAmount: number): Promise<void>;
  whitelistMintTokens(mintAmount: number): Promise<void>;
}

export default class MintWidget extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

  }

  private canMint(): boolean {
    return !this.props.isPaused || this.canWhitelistMint();
  }

  private canWhitelistMint(): boolean {
    return this.props.isWhitelistMintEnabled && this.props.isUserInWhitelist;
  }

  private async mint(): Promise<void> {
    if (!this.props.isPaused) {
      await this.props.mintTokens(1);

      return;
    }

    await this.props.whitelistMintTokens(1);
  }

  render() {
    return (
      <>
        {this.canMint() &&
          <div className="mint-widget">
            <div className={btnStyles.controls}>
              {/* <button className={`${btnStyles.decreaseBtn} ${btnStyles.btn}`} onClick={() => this.decrementMintAmount()}><span>-</span></button>
              <span className={btnStyles.mintAmt}><span>{this.state.mintAmount}</span></span>
              <button className={`${btnStyles.increaseBtn} ${btnStyles.btn}`} onClick={() => this.incrementMintAmount()}><span>+</span></button> */}
              <button className={`${btnStyles.btn} ${btnStyles.mintBtn}`} onClick={() => this.mint()}>
                <strong>Claim 
                {<span> (Ξ {this.props.tokenPrice ? utils.formatEther(this.props.tokenPrice.mul(1)) : 'Loading'}<span>{this.props.isUserInWhitelist && <span className={styles.vipLabel}> VIP</span>}</span>)</span>}
                </strong>
              </button>
            </div>
          </div>}
      </>
    );
  }
}
