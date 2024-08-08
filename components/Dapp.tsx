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

import React, { useEffect, useState } from 'react';
import CollectionConfig from '../lib/CollectionConfig';
import MintWidget from './MintWidget';
import styles from '../styles/Home.module.scss';
import btnStyles from '../styles/ConnectButton.module.scss';
import { Badge } from './season-five/Badge';
import Web3 from 'web3';
import { reverseLookup } from '../lib/reverseLookup';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { readContract } from '@wagmi/core'
import { wagmiConfig, wagmiConfigExternal } from '../pages/_app';
import { mainnet } from 'viem/chains';
import { ReadContractParameters } from 'viem';
import ParticlesBackground from './ParticlesBackground';

const ContractAbi = require('../lib/ETHRankBadge.json').abi;

const Dapp = () => {

  const { isConnected, address, chain } = useAccount();
  const [rank, setRank] = useState(1900)
  const [progress, setProgress] = useState([])
  const [score, setScore] = useState(420)
  const [badgeAddress, setBadgeAddress] = useState('YOURNAME.ETH')
  const [loadingBadge, setLoadingBadge] = useState(false)
  const [errorLoadingBadge, setErrorLoadingBadge] = useState(false)
  const [mintComplete, setMintComplete] = useState(false)
  const [tokenPrice, setTokenPrice] = useState<bigint>()
  const [isPaused, setIsPaused] = useState(false)
  const [errorMsg, setErrorMsg] = useState<null | string>(null)

  useEffect(() => {
      reFetchContractData();
  }, [address, chain]);

  const renderBadgePreview = async () => {

    if (!isConnected || !address) return;

    const ethRankResponse = await fetch(`/api/address/${address}`,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      });

    setLoadingBadge(true);

    if (ethRankResponse.ok) {
      const { rank, score, progress } = await ethRankResponse.json();
      let web3Domain;
      // ENS stuff - resolve 0x21ada3.. to nick.eth
      const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`);
      web3Domain = await reverseLookup(address?.toLowerCase() || '', web3);

      setBadgeAddress(web3Domain || address)
      setScore(score);
      setRank(rank);
      setProgress(progress);
      setLoadingBadge(false);
      setErrorLoadingBadge(false);
    } else {
      setLoadingBadge(false);
      setErrorLoadingBadge(true);
    }
  }


  const fetchPriceAndPausedStatus = async () => {
    const costFromContract = await readContract(wagmiConfig, getReadConfig('cost') as ReadContractParameters);
    const pausedFromContract = await readContract(wagmiConfig, getReadConfig('paused') as ReadContractParameters);
    setTokenPrice(costFromContract as bigint);
    setIsPaused(pausedFromContract as boolean);
  }

  const reFetchContractData = async () => {

    if (chain?.id === mainnet.id) {
      await fetchPriceAndPausedStatus();
    }
  
    renderBadgePreview();
  }

  const { writeContract } = useWriteContract({mutation:{
    onError(e: Error) {
      // @ts-ignore
      setErrorMsg(e.shortMessage || e.message)
    },
    onSuccess() {
      setMintComplete(true)
    }
  }})

  const mintTokens = async (amount: number): Promise<void> => {
    try {
      if (!tokenPrice) await fetchPriceAndPausedStatus();

      writeContract({
        address: CollectionConfig.contractAddress[CollectionConfig.currentSeason]! as `0xstring`,
        abi: ContractAbi,
        functionName: 'mint',
        args: [1],
        value: tokenPrice,
        account: address,
      })
      
    } catch (e) {
      setErrorMsg('Unable to mint token');
    }
  }

  const isMainnet = (): boolean => {
    return isConnected && chain?.id === CollectionConfig.mainnet.chainId;
  }

  const { open } = useWeb3Modal()

  return (
    <>

  
      <div className={styles.colOne}>
        <div className={isConnected && styles.badgeLoading || styles.badge}>
          {loadingBadge ?
          <><span className="loading-spinner"></span> Badge Loading</> : 
          <Badge address={badgeAddress} score={score} rank={rank} progress={progress} />
          }

          <ParticlesBackground />
        </div>
      </div>

      <div className={styles.colTwo}>

        <h1 className={styles.title}>Claim your Season V<br /><strong>Dynamic Badge</strong></h1>
        <h3>Updates daily with your score and rank</h3>

        {!isConnected ?
          <div className={styles.connectBtn}>
            <button 
              className={`${btnStyles.btn}`} 
              onClick={() => open()}>
                <strong>Connect</strong>
              </button>
          </div> : null
        }

        {isConnected ?
          <>
              <div className={styles.mintDapp}>
                <MintWidget
                  isMainnet={isMainnet()}
                  tokenPrice={tokenPrice || BigInt(0)}
                  isPaused={isPaused}
                  mintTokens={(mintAmount) => mintTokens(mintAmount)}
                />
              </div>
          </>
          : null
        }
      </div>

      {/* {isMainnet() ?
        <div className="not-mainnet">
          You are not connected to the main network.
          <span className="small"> Current network: <strong>{chain?.name}</strong></span>
        </div>
        : null} */}

      {errorMsg ? <div className={styles.error}><p>{errorMsg}</p><button onClick={() => setErrorMsg(null)}>Close</button></div> : null}

      {mintComplete ? <div className={styles.success}><p>Mint successful! Your badge is now in your wallet. View your updated profile <a href={`/address/${address}?${new Date().getTime()}`}>here</a>.</p><button onClick={() => setMintComplete(false)}>Close</button></div> : null}

    </>
  );

}

export default Dapp;


function getReadConfig(functionName: string) {
  return {
    address: CollectionConfig.contractAddress[CollectionConfig.currentSeason]! as `0xstring`,
    abi: ContractAbi,
    functionName,
  };
}

