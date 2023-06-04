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
  v2?: boolean;
  totalSupply: number;
  maxSupply: number;
}

interface State {
  mintAmount: number;
}

const defaultState: State = {
  mintAmount: 1,
};

export default class MintWidget extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  private canMint(): boolean {
    return !this.props.isPaused || this.canWhitelistMint();
  }

  private canWhitelistMint(): boolean {
    return this.props.isWhitelistMintEnabled && this.props.isUserInWhitelist;
  }

  private incrementMintAmount(): void {
    this.setState({
      mintAmount: Math.min(this.props.maxMintAmountPerTx, this.state.mintAmount + 1),
    });
  }

  private decrementMintAmount(): void {
    this.setState({
      mintAmount: Math.max(1, this.state.mintAmount - 1),
    });
  }

  private async mint(): Promise<void> {
    if (!this.props.isPaused) {
      await this.props.mintTokens(this.state.mintAmount);

      return;
    }

    await this.props.whitelistMintTokens(this.state.mintAmount);
  }

  render() {
    return (
      <>
        {this.canMint() ?
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
          </div>
          :
          <div className={styles.cannotMint}>
            {this.props.isUserInWhitelist && <div className={styles.vip}>🎉 Congratulations, you are on the <strong>VIP List!</strong> 🎉</div>}
            
            {!this.props.isWhitelistMintEnabled || (!this.props.isUserInWhitelist && this.props.isWhitelistMintEnabled) && <div><span className="emoji">⏳</span> Minting starts <strong>January 14, 2022</strong></div>}
            <br />
            {/* <a href="https://opensea.io/collection/ethrankbadge-season-two"target="_blank" rel="noreferrer"><span>View Collection on OpenSea</span></a> */}
          </div>
        }
      </>
    );
  }
}
