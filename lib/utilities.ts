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

import { PrismaClient } from "@prisma/client";
import Web3 from 'web3';
import { Transaction } from "../pages/api/badges/[season]/[tokenID]";
import { generateMetadata, getUpdatedScoreAndSaveETHRank } from "../pages/api/checkForNewDynamicMints";
import { reverseLookup } from "./reverseLookup";

import supportedChains from './chains'
import { IChainData } from './types'
import CollectionConfig from "./CollectionConfig";

export function getChainData(chainId?: number): IChainData | null {
  if (!chainId) {
    return null
  }
  const chainData = supportedChains.filter(
    (chain: any) => chain.chain_id === chainId
  )[0]

  if (!chainData) {
    throw new Error(
      `ChainId missing or not supported: ${chainId}`
    )
  }

  const API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;

  if (
    chainData.rpc_url.includes('infura.io') &&
    chainData.rpc_url.includes('%API_KEY%') &&
    API_KEY
  ) {
    const rpcUrl = chainData.rpc_url.replace('%API_KEY%', API_KEY)

    return {
      ...chainData,
      rpc_url: rpcUrl,
    }
  }

  return chainData
}

export function ellipseAddress(address = '', width = 10): string {
  if (!address) {
    return ''
  }
  return `${address.slice(0, width)}...${address.slice(-width)}`
}

const dev = process.env.NODE_ENV !== 'production';
const testnet = dev ? '' : '';

export async function checkAndGenerateBadge(tokenID: string, season: string, prisma: PrismaClient) {

  let mintAddress = '';

  // const ONE_HOUR = 60 * 60 * 1000;
  // const anHourAgo = Date.now() - ONE_HOUR;
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - .5);

  // fetch the image from DB
  // todo: add updatedAt to filter these out more efficiently
  const imageCache = await prisma.badge.findFirst({
    where: {
      mint: parseInt(tokenID, 10),
      season: parseInt(season, 10)
    }
  });

  if (imageCache) {

    mintAddress = imageCache.address;

    // cache images for 24 hours
    // todo: move this into above query
    if (imageCache.updatedAt > (dev ? today : yesterday)) {

      // we arent storing progress in the badge table, so it must be fetched from the ethrank table
      // todo: use relations so that this can be done in one query/join
      const progressCache = await prisma.address.findFirst({
        select: {
          progress: true,
        },
        where: {
          address: mintAddress,
          season: parseInt(season, 10)
        }
      });

      // cached version, bail out here and served cache version
      return {
        props: {
          address: imageCache?.name?.length ? imageCache.name : imageCache.address,
          score: imageCache.score,
          rank: imageCache.rank,
          progress: progressCache?.progress || [],
          metadata: await generateMetadata({
            address: imageCache?.name?.length ? imageCache.name : imageCache.address,
            season: imageCache.season.toString(),
            tokenID: imageCache.mint,
            score: imageCache.score,
            rank: imageCache.rank
          })
        }
      }
    }

  } else {

    // if image is not found, check for it on etherscan
    const contractAddress = CollectionConfig.contractAddress[parseInt(season, 10)];
    const ethContractData = `https://api${testnet}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${contractAddress}&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`
    const contractTransactions = await fetch(ethContractData).then((res) => res.json())

    if (!contractTransactions?.result?.length) {
      return {
        props: {
          error: 'unable to fetch contract'
        }
      }
    }

    // check for this in the list
    const exists = contractTransactions.status === '1' && contractTransactions.result.filter((transaction: Transaction) => {
      return transaction.tokenID.toString() === tokenID.toString();
    });

    if (!exists || !exists.length) {
      return {
        props: {
          error: 'token not found'
        }
      }
    } else {
      mintAddress = exists[0].to;
    }
  }

  if (!mintAddress.length) {
    return {
      props: {
        error: 'mint address not found'
      }
    }
  }
  let ensName;
  // ENS stuff - resolve 0x21ada3.. to nick.eth
  const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`);
  ensName = await reverseLookup(mintAddress.toLowerCase(), web3);

  const rev = imageCache?.rev || 0;

  // update data on aws and serve the svg
  const result = await getUpdatedScoreAndSaveETHRank({
    existingID: imageCache?.id,
    tokenID: parseInt(tokenID, 10),
    mintAddress,
    rev: rev + 1,
    season,
    name: ensName
  });
  // @ts-ignore
  if (result?.error) {
    return {
      props: {
        // @ts-ignore
        error: result.error
      }
    }
  }
  return {
    props: {
      address: ensName || mintAddress,
      // @ts-ignore
      score: result.score,
      // @ts-ignore
      rank: result.rank,
      // @ts-ignore
      progress: result.progress,
      // @ts-ignore
      metadata: result.metadata
    }
  }
}
