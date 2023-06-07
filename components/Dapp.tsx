import React, { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers'
import CollectionConfig from '../../smart-contract/config/CollectionConfig';
import MintWidget from './MintWidget';
import Whitelist from '../lib/Whitelist';
import styles from '../styles/Home.module.scss';
import { ETHRankBadge } from '../../smart-contract/typechain';
import { Badge } from './season-four/Badge';
import Web3 from 'web3';
import { reverseLookup } from '../lib/reverseLookup';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';
import { useWeb3ModalTheme, Web3Button } from '@web3modal/react'
import { time } from 'console';

const ContractAbi = require('../../smart-contract/artifacts/contracts/ETHRankBadge.sol/ETHRankBadge.json').abi;

const Dapp = () => {

  const { setTheme } = useWeb3ModalTheme()
  setTheme({ themeColor: 'blue' });

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork()

  const { data, error, isLoading, refetch } = useSigner()
  const provider = useProvider()
  const [networkConfig, setNetworkConfig] = useState(CollectionConfig.mainnet);

  const [totalSupply, setTotalSupply] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [contract, setContract] = useState<ETHRankBadge | null>(null)
  const [rank, setRank] = useState(1900)
  const [progress, setProgress] = useState([])
  const [score, setScore] = useState(420)
  const [badgeAddress, setBadgeAddress] = useState('YOURNAME.ETH')
  const [loadingBadge, setLoadingBadge] = useState(false)
  const [errorLoadingBadge, setErrorLoadingBadge] = useState(false)
  const [mintComplete, setMintComplete] = useState(false)
  const [maxMintAmountPerTx, setMaxMintAmountPerTx] = useState(0)
  const [tokenPrice, setTokenPrice] = useState<BigNumber | null>(null)
  const [isPaused, setIsPaused] = useState(true)
  const [isWhitelistMintEnabled, setIsWhitelistMintEnabled] = useState(false)
  const [isUserInWhitelist, setIsUserInWhitelist] = useState(false)
  const [errorMsg, setErrorMsg] = useState<null | string>(null)

  useEffect(() => {
    renderBadgePreview();
  }, [address, data]);

  const renderBadgePreview = async () => {

    if (!isConnected) return;

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

    if (!address || !chain || !data) {
      return;
    }

    if (chain.id === CollectionConfig.mainnet.chainId) {
      setNetworkConfig(CollectionConfig.mainnet);
    } else if (chain.id === CollectionConfig.testnet.chainId) {
      setNetworkConfig(CollectionConfig.testnet);
    } else {
      setErrorMsg('Unsupported network!');
      return;
    }

    // if (await provider.getCode(CollectionConfig.contractAddress[CollectionConfig.currentSeason]!) === '0x') {
    //   setError('Could not find the contract, are you connected to the right chain?');

    //   return;
    // }
    // @ts-ignore
    let contract = new ethers.Contract(
      CollectionConfig.contractAddress[CollectionConfig.currentSeason]!,
      ContractAbi,
      data,
    ) as ETHRankBadge

    setContract(contract);
    setMaxSupply((await contract.maxSupply()).toNumber())
    setTotalSupply((await contract.totalSupply()).toNumber())
    setMaxMintAmountPerTx((await contract.maxMintAmountPerTx()).toNumber())
    setTokenPrice(await contract.cost())
    setIsPaused(await contract.paused())
    setIsWhitelistMintEnabled(await contract.whitelistMintEnabled())
    setIsUserInWhitelist(Whitelist.contains(address ?? ''))
  }

  const mintTokens = async (amount: number): Promise<void> => {
    try {
      if (!tokenPrice) return setErrorMsg('no token price');
      await contract?.mint(amount, { value: tokenPrice.mul(amount) });
      setMintComplete(true);
    } catch (e) {
      setErrorMsg('Unable to mint token');
    }
  }

  const whitelistMintTokens = async (amount: number): Promise<void> => {
    try {
      if (!tokenPrice) return setErrorMsg('no token price');
      await contract?.whitelistMint(amount, Whitelist.getProofForAddress(address || ''), { value: tokenPrice.mul(amount) });
      setMintComplete(true);
    } catch (e) {
      setErrorMsg('Unable to mint from VIP list');
    }
  }

  const isContractReady = (): boolean => {
    return contract !== undefined;
  }

  const isSoldOut = (): boolean => {
    return maxSupply !== 0 && totalSupply < maxSupply;
  }

  const isNotMainnet = (): boolean => {
    return !!isConnected && chain?.id !== CollectionConfig.mainnet.chainId;
  }

  const isSaleOpen = (): boolean => {
    return isWhitelistMintEnabled || !isPaused;
  }

  return (
    <>

  
      <div className={styles.colOne}>
        <div className={isConnected && styles.badgeLoading || styles.badge}>
          <Badge address={badgeAddress} score={score} rank={rank} progress={progress} />
        </div>
      </div>

      <div className={styles.colTwo}>

        {/* {((!isUserInWhitelist && isWhitelistMintEnabled) || (isPaused && !isWhitelistMintEnabled)) ?
          <h3>Coming Soon</h3> : <h3>Now Minting</h3>
        } */}

        <h3>Now Minting</h3>

        <h1 className={styles.title}>Season IV <strong>Dynamic Badges</strong></h1>

        {!isConnected ?
          <div className={styles.connectBtn}>
            <Web3Button />
          </div> : null
        }

        {isConnected ?
          <>
            {isContractReady() && tokenPrice ?
              <div className={styles.mintDapp}>
                <MintWidget
                  networkConfig={networkConfig}
                  tokenPrice={tokenPrice}
                  maxMintAmountPerTx={maxMintAmountPerTx}
                  isPaused={isPaused}
                  isWhitelistMintEnabled={isWhitelistMintEnabled}
                  isUserInWhitelist={isUserInWhitelist}
                  mintTokens={(mintAmount) => mintTokens(mintAmount)}
                  whitelistMintTokens={(mintAmount) => whitelistMintTokens(mintAmount)}
                />
              </div>
              :
              <div className={styles.mintDapp}>
                Loading collection data...
              </div>
            }
          </>
          : null
        }
      </div>


      {isNotMainnet() ?
        <div className="not-mainnet">
          You are not connected to the main network.
          <span className="small"> Current network: <strong>{chain?.name}</strong></span>
        </div>
        : null}

      {errorMsg ? <div className={styles.error}><p>{errorMsg}</p><button onClick={() => setErrorMsg(null)}>Close</button></div> : null}

      {mintComplete ? <div className={styles.success}><p>Mint successful! Your badge is now in your wallet. View your updated profile <a href={`/address/${address}?${new Date().getTime()}`}>here</a>.</p><button onClick={() => setMintComplete(false)}>Close</button></div> : null}

    </>
  );
}

export default Dapp;