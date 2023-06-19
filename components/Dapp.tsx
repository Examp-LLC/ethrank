import React, { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers'
import CollectionConfig from '../../smart-contract/config/CollectionConfig';
import MintWidget from './MintWidget';
import styles from '../styles/Home.module.scss';
import { ETHRankBadge } from '../../smart-contract/typechain';
import { Badge } from './season-four/Badge';
import Web3 from 'web3';
import { reverseLookup } from '../lib/reverseLookup';
import { useAccount, useContractRead, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useWeb3ModalTheme, Web3Button } from '@web3modal/react'

const ContractAbi = require('../../smart-contract/artifacts/contracts/ETHRankBadge.sol/ETHRankBadge.json').abi;

const Dapp = () => {

  // const { setTheme } = useWeb3ModalTheme()
  // setTheme({ themeColor: 'green' });

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork()

  // const { data, error, isLoading, refetch } = useSigner()
  // const provider = useProvider()
  const [networkConfig, setNetworkConfig] = useState(CollectionConfig.mainnet);

  const [totalSupply, setTotalSupply] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [contract, setContract] = useState<ETHRankBadge | null>(null)
  const [rank, setRank] = useState(1900)
  const [progress, setProgress] = useState([])
  const [score, setScore] = useState(420)
  const [mintAmount, setMintAmount] = useState(1)
  const [badgeAddress, setBadgeAddress] = useState('YOURNAME.ETH')
  const [loadingBadge, setLoadingBadge] = useState(false)
  const [errorLoadingBadge, setErrorLoadingBadge] = useState(false)
  const [mintComplete, setMintComplete] = useState(false)
  const [maxMintAmountPerTx, setMaxMintAmountPerTx] = useState(0)
  const [tokenPrice, setTokenPrice] = useState<bigint>()
  const [isPaused, setIsPaused] = useState(true)
  const [errorMsg, setErrorMsg] = useState<null | string>(null)

  useEffect(() => {
    renderBadgePreview();

    setTokenPrice(costFromContract.data as unknown as bigint)
    setMaxSupply(maxSupplyFromContract.data as unknown as number)
    setTotalSupply(totalSupplyFromContract.data as unknown as number)
    setIsPaused(pausedFromContract.data as unknown as boolean)
  }, [address]);

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

    if (!address || !chain) {
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
    // let contract = new ethers.Contract(
    //   CollectionConfig.contractAddress[CollectionConfig.currentSeason]!,
    //   ContractAbi,
    //   data,
    // ) as ETHRankBadge

    // setMaxSupply((await contract.maxSupply()).toNumber())
    // setTotalSupply((await contract.totalSupply()).toNumber())
    // setMaxMintAmountPerTx((await contract.maxMintAmountPerTx()).toNumber())
    // setIsPaused(await contract.paused())
    // setIsUserInWhitelist(Whitelist.contains(address ?? ''))
  }


  const costFromContract = useContractRead(getReadConfig('cost'));
  const pausedFromContract = useContractRead(getReadConfig('paused'));
  const maxSupplyFromContract = useContractRead(getReadConfig('maxSupply'));
  const totalSupplyFromContract = useContractRead(getReadConfig('totalSupply'));

  const mintCall = useContractWrite({
    address: CollectionConfig.contractAddress[CollectionConfig.currentSeason]!,
    abi: ContractAbi,
    functionName: 'mint',
    args: [1],
    value: tokenPrice,
    account: address,
    onError(e) {
      // @ts-ignore
      setErrorMsg(e.shortMessage || e.message)
    },
    onSuccess() {
      setMintComplete(true)
    }
  })

  const mintTokens = async (amount: number): Promise<void> => {
    try {
      if (!tokenPrice) return setErrorMsg('no token price');

      if (!mintCall.write) return (setErrorMsg('contract not found'));

      mintCall.write();
      
    } catch (e) {
      setErrorMsg('Unable to mint token');
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
    return !isPaused;
  }

  return (
    <>

  
      <div className={styles.colOne}>
        <div className={isConnected && styles.badgeLoading || styles.badge}>
          {loadingBadge ?
          <><span className="loading-spinner"></span> Badge Loading</> : 
          <Badge address={badgeAddress} score={score} rank={rank} progress={progress} />
          }
        </div>
      </div>

      <div className={styles.colTwo}>

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
                  mintTokens={(mintAmount) => mintTokens(mintAmount)}
                />
              </div>
              :
              <div className={styles.mintDapp}>
                <span className="loading-spinner"></span> Reticulating splines...
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

function getReadConfig(functionName: string) {
  return {
    address: CollectionConfig.contractAddress[CollectionConfig.currentSeason]!,
    abi: ContractAbi,
    functionName,
  };
}
