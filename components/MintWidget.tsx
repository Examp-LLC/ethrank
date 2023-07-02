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

import { utils } from 'ethers';
import React from 'react';
import btnStyles from '../styles/ConnectButton.module.scss';

interface Props {
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
