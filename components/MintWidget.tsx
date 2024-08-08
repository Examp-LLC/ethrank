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

import { formatEther } from 'ethers';
import React from 'react';
import btnStyles from '../styles/ConnectButton.module.scss';
import { mainnet } from 'viem/chains';
import { useSwitchChain } from 'wagmi';

interface Props {
  tokenPrice: bigint;
  isMainnet: boolean;
  isPaused: boolean;
  mintTokens(mintAmount: number): Promise<void>;
}

const MintWidget = ({tokenPrice, isPaused, isMainnet, mintTokens}: Props) => {

  const { switchChain } = useSwitchChain();

  const canMint = (): boolean => {
    return !isPaused;
  }

  const mint = async (): Promise<void> => {
    if (!isPaused) await mintTokens(1);
  }

  const switchNetwork = async (): Promise<void> => {
    await switchChain({ chainId: mainnet.id })
  }

  return (
    <>
      {canMint() &&
        <div className="mint-widget">
          <div className={btnStyles.controls}>
            
          {tokenPrice ? 
            <button className={`${btnStyles.btn} ${btnStyles.wide} ${btnStyles.mintBtn}`} onClick={() => mint()}>
              <strong>Claim 
                <span>
                  (Ξ {formatEther(tokenPrice)})
                </span>
              </strong>
            </button>

            :

            <button className={`${btnStyles.btn} ${btnStyles.wide} ${btnStyles.mintBtn}`} onClick={() => switchNetwork()}>
              <strong>Claim</strong>
            </button>
            }
          </div>
        </div>}
    </>
  );
}

export default MintWidget;
