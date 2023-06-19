import { utils } from 'ethers';
import React from 'react';
import NetworkConfigInterface from '../../smart-contract/lib/NetworkConfigInterface';
import btnStyles from '../styles/ConnectButton.module.scss';

interface Props {
  networkConfig: NetworkConfigInterface;
  tokenPrice: bigint;
  isPaused: boolean;
  mintTokens(mintAmount: number): Promise<void>;
}

export default class MintWidget extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

  }

  private canMint(): boolean {
    return !this.props.isPaused;
  }

  private async mint(): Promise<void> {
    if (!this.props.isPaused) {
      await this.props.mintTokens(1);

      return;
    }

  }

  render() {
    return (
      <>
        {this.canMint() &&
          <div className="mint-widget">
            <div className={btnStyles.controls}>
              <button className={`${btnStyles.btn} ${btnStyles.mintBtn}`} onClick={() => this.mint()}>
                <strong>Claim 
                {<span> (Ξ {this.props.tokenPrice ? utils.formatEther(this.props.tokenPrice) : 'Loading'}<span></span>)</span>}
                </strong>
              </button>
            </div>
          </div>}
      </>
    );
  }
}
