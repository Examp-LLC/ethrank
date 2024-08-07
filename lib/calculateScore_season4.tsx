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
// @ts-nocheck
import Web3 from 'web3';
import { PrismaClient } from '@prisma/client';
import { lookupUnstoppableName } from '../pages/unstoppableName/[unstoppableName]';
import { convertToLowerCase } from '../pages/address/[address]';
import { IBlockScoutTx } from './types';
import { getAchievements } from './constants';
import { reverseLookup } from './reverseLookup';

import { AlchemyMultichainClient } from '../lib/alchemy-multichain-client';
import { Network } from 'alchemy-sdk';


const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const ETHPLORER_API_KEY = process.env.ETHPLORER_API_KEY;
const POAP_API_KEY = process.env.POAP_API_KEY;
const ALCHEMY_ETH_MAINNET_KEY = process.env.ALCHEMY_ETH_MAINNET_KEY;
const ALCHEMY_MATIC_MAINNET_KEY = process.env.ALCHEMY_MATIC_MAINNET_KEY;

interface ETHRankAddressResponse {
  props: {
      address: string;
      score: number;
      totalTransactions: number;
      spentOnGas: string;
      activeSince: string;
      rank: number;
      progress: string[];
      error: boolean;
      name: string;
  }
}


export async function calculateScore(address: string, prisma: PrismaClient, unstoppableName?: string | string[], attempts = 0): Promise<ETHRankAddressResponse> {
  let score = 0, rank = 0;
  let totalPointsPossible = 0;
  let completedAchievements = 0;
  let totalTransactions = 0;
  let spentOnGas = 0;
  let activeSince = new Date();
  let progress: string[] = []; // list of completed steps, goals, achievements

  // TODO - useState for the progress above and strongly reconsider data struct
  let sentTransactions = [];
  let receivedTransactions = [];
  let ownedTokens = [];
  let ownedPolygonTokens = [];
  let cached = false;
  let error = false;
  let name = '';
  let transactionHashes = [];
  let isDupeTransaction = false;
  let THIS_SEASON = 4;
  let ACHIEVEMENTS = getAchievements(THIS_SEASON);

  const defaultConfig = {
    apiKey: ALCHEMY_ETH_MAINNET_KEY,
    network: Network.ETH_MAINNET
  };
  const overrides = {
    [Network.MATIC_MAINNET]: { apiKey: ALCHEMY_MATIC_MAINNET_KEY, maxRetries: 10 }
  };
  const alchemy = new AlchemyMultichainClient(defaultConfig, overrides);

  // ERROR case  - /address/something-bad-we-dont-support
  if (!Web3.utils.isAddress(address)) {
    error = true;

    // HAPPY PATH - /address/0x53db9542e3a0cdbfebb659d001799ba0b37b2275
  } else if (address) {

    if (Array.isArray(address)) {
      address = address[0];
    }

    const addressCache = await prisma.address.findFirst({
      where: {
        AND: {
          address: {
            equals: address.toLowerCase(),
          },
          season: THIS_SEASON
        }
      }
    });

    if (addressCache && !addressCache.active) {
      error = true;
    }

    if (!error) {
      // store in cache for 24 hours
      if (addressCache && 
          addressCache.updatedAt > new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) && 
          !process.env.DEVELOPMENT) {
        progress = JSON.parse(addressCache.progress);
        score = addressCache.score;
        name = addressCache.name;
        totalTransactions = addressCache.transactions || 0;
        // @ts-ignore
        spentOnGas = addressCache.spentOnGas || 0;
        // @ts-ignore
        activeSince = addressCache.activeSince;
        cached = true;
      }

      // Unstoppable edge case 1 - If we find an unstoppable domain in the cache, we use that
      // TODO: do ENS the same way (no need for reverse lookup if we know the .eth address)
      if (addressCache?.name?.length && addressCache?.name.indexOf('.eth') === -1) {
        unstoppableName = addressCache.name;
      }

      // Unstoppable edge case 2 - If user previously existed without unstoppable domain, 
      // but is now passing in one, force a cache refresh
      else if (!addressCache?.name?.length && unstoppableName) {
        cached = false;
      }

      if (!addressCache?.transactions) {
        cached = false;
      }

      if (!cached || process.env.DEVELOPMENT) {

        if (unstoppableName && typeof unstoppableName === 'string') {
          const unstoppable = await lookupUnstoppableName(unstoppableName.toLowerCase());
          if (unstoppable.address && unstoppable.address.length && unstoppable.address.toLowerCase() === address.toLowerCase()) {
            name = unstoppableName;
          } else {
            error = unstoppable.error;
          }
        } else {
          // reverse resolve 0x21ada3.. to nick.eth/nick.crypto
          const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`);
          const domainName = await reverseLookup(address.toLowerCase(), web3);

          if (domainName) {
            name = domainName;
          }

        }
        
        const mainnetTxns = await fetchTxns(address, Network.ETH_MAINNET)
        const mainnetTxnsTo = await fetchTxns(address, Network.ETH_MAINNET, true)
        const maticTxns = await fetchTxns(address, Network.MATIC_MAINNET)
        const maticTxnsTo = await fetchTxns(address, Network.MATIC_MAINNET, true)

        const urls = [
          // ERC-20 token holdings
          `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=${ETHPLORER_API_KEY}`,

          // POAP
          `https://api.poap.tech/actions/scan/${address}`,

        ];

        const getHeaders = (url: string) => {
          if (url.indexOf('poap.tech') > -1) {
            return {
                headers: {
                  'X-API-Key': POAP_API_KEY || ''
                }
              }
          }
        }

        const results = await Promise.all(
          urls.map((url) => fetch(url,
            getHeaders(url)).then((res) => res.json()))
        ).catch((e) => console.log);


        // Mainnet
        const tokens = results[0] && results[0].tokens || [];
        
        const poaps = results[1] && Array.isArray(results[1]) && results[1] || false;

        if (!mainnetTxns || !mainnetTxns.transfers?.length ||
          !maticTxns || !maticTxns.transfers?.length || 
          !poaps) {
          console.log(`Error fetching upstream data, trying again 
          ${mainnetTxns.length} 
          ${maticTxns.length} 
          ${poaps.length}
          ${attempts} attempts` )
          attempts = attempts + 1;
          if (attempts < 5) {
            // return calculateScore(address, prisma, unstoppableName, attempts);
          } else {
            throw new Error('Unable to calculate score');
          }
        }

        const allTransactions = [
          ...mainnetTxns.transfers,
          ...mainnetTxnsTo.transfers,
          ...applyPolygonProperty(maticTxns.transfers),
          ...applyPolygonProperty(maticTxnsTo.transfers),
        ];

        totalTransactions = allTransactions.length;
        if (totalTransactions) {
          let firstBlock = await alchemy
            .forNetwork(Network.ETH_MAINNET)
            .core
            .getBlock(allTransactions[0].blockNum);
          activeSince = new Date(firstBlock.timestamp * 1000);
        }

        const markStepCompleted = (j: any = '', k: any = '', l: any = '') => {
          progress.push(`${j}${k}${l}`);
        };

        const isComplete = (j: any = '', k: any = '', l: any = '') => {
          return progress.indexOf(`${j}${k}${l}`) > -1;
        };

        // THE LOOP - we are only going to loop through all transactions ONCE,
        // so do whatever you need to do in here and before/after.
        for (let i = 0; i < allTransactions.length; i++) {

          // skip failed txs
          if (allTransactions[i].isError === "1") {
            continue;
          }

          isDupeTransaction = false;

          // skip dupes
          if (allTransactions[i].hash) {
            if (transactionHashes[allTransactions[i].hash]) {
              isDupeTransaction = true;
              totalTransactions--;
            }

            transactionHashes[allTransactions[i].hash] = allTransactions[i].hash;
          }


          if (!isDupeTransaction && !allTransactions[i].chainID) {
            // @ts-ignore
            if (convertToLowerCase(address).indexOf(convertToLowerCase(allTransactions[i].from)) > -1 !== false) {
              spentOnGas = Number(spentOnGas) + (parseFloat(allTransactions[i].gasPrice) / Math.pow(10, 18) +
                parseFloat(allTransactions[i].cumulativeGasUsed) / Math.pow(10, 18)) *
                parseFloat(allTransactions[i].gasUsed);
            }
          }
          // SCORE = step points + goal points (if all steps complete) + achievement points (if all goals complete)
          for (let j = 0; j < ACHIEVEMENTS.length; j++) {
            const achievement = ACHIEVEMENTS[j];

            let totalPointsForThisAchievement = achievement.points;
            let completedGoalsForThisAchievement = 0;

            if (achievement.goals && !isComplete(j)) {
              for (let k = 0; k < achievement.goals.length; k++) {
                let goal = achievement.goals[k];
                let completedStepsForThisGoal = 0;

                totalPointsForThisAchievement += goal.points;
                if (goal.steps && !isComplete(j, k)) {
                  for (let l = 0; l < goal.steps.length; l++) {
                    let addresses = [];
                    let step = goal.steps[l];

                    totalPointsForThisAchievement += step.points;

                    // if (allTransactions[i].hash === '0x2346de0727c1f3e0cf9fdaa486c0d7ecdfc1533dc41428c9467e0b7ea43f4d97') console.log(allTransactions[i])
                    if (!isComplete(j, k, l)) {

                      switch (step.type) {
                        case 'transaction_to_address_count':


                          // @ts-ignore
                          addresses = convertToLowerCase(step.params.address || address);

                          if ((allTransactions[i].to?.length && addresses.indexOf(convertToLowerCase(allTransactions[i].to)) > -1) || 
                            (allTransactions[i].rawContract?.address?.length && addresses.indexOf(convertToLowerCase(allTransactions[i].rawContract?.address))) > -1) {
                            
                            if (!sentTransactions[j]) {
                              sentTransactions[j] = [] as Array<Array<number>>;
                            }
                            if (!sentTransactions[j][k]) {
                              sentTransactions[j][k] = [];
                            }
                            if (!sentTransactions[j][k][l]) {
                              sentTransactions[j][k][l] = 0;
                            }
                            sentTransactions[j][k][l]++;
                            // @ts-ignore
                            if (sentTransactions[j][k][l] === step.params.count) {
                              // console.log('step completed: transaction_to_address_count',   step.name, step.points, goal.name, achievement.name, allTransactions[i].hash)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }
                          break;

                        case 'transaction_from_address_count':

                          // @ts-ignore
                          addresses = convertToLowerCase(step.params.address || address);
                          if (allTransactions[i].from?.length && addresses.indexOf(convertToLowerCase(allTransactions[i].from)) > -1) {
                            if (!receivedTransactions[j]) {
                              receivedTransactions[j] = [] as Array<Array<number>>;
                            }
                            if (!receivedTransactions[j][k]) {
                              receivedTransactions[j][k] = [];
                            }
                            if (!receivedTransactions[j][k][l]) {
                              receivedTransactions[j][k][l] = 0;
                            }
                            receivedTransactions[j][k][l]++;

                            if (receivedTransactions[j][k][l] === step.params.count) {
                              // console.log('step completed: transaction_from_address_count',  step.name, step.points,goal.name, achievement.name)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }
                          break;

                        case 'send_eth_amount':
                          // Don't count dupes or sidechain transactions
                          if (isDupeTransaction || allTransactions[i].chainID) continue;
                          
                          const amountSent = allTransactions[i].value;
                          // @ts-ignore
                          if (amountSent >= step.params.amount && (allTransactions[i].category === "external" || allTransactions[i].category === "internal")) { // filter out contract allTransactions
                            // console.log('step completed: send_eth_amount', step.name, step.points, goal.name, achievement.name)
                            markStepCompleted(j, k, l);
                            // if step is completed, include step points in score
                            score += step.points;
                          }
                          break;

                        case 'own_token_count':
                          // We only want to tally this once since we are inside THE LOOP
                          if (i === 0) {
                            // @ts-ignore
                            if (tokens && tokens.length >= step.params.count) {
                              // console.log('step completed: own_token_count', step.name, step.points, goal.name, achievement.name)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }

                          break;
                        case 'own_poap_count':
                          // We only want to tally this once since we are inside THE LOOP
                          if (i === 0) {
                            // @ts-ignore
                            if (poaps && poaps.length >= step.params.count) {
                              // console.log('step completed: own_poap_count', step.name, step.points, goal.name, achievement.name)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }

                          break;

                        case 'spend_gas_amount':
                          // Don't count dupes or sidechain transactions
                          if (isDupeTransaction || allTransactions[i].chainID) continue;

                          // @ts-ignore
                          addresses = convertToLowerCase(address);

                          if ((addresses.indexOf(convertToLowerCase(allTransactions[i].from)) > -1 !== false) ||
                              (allTransactions[i].rawContract?.address && addresses.indexOf(convertToLowerCase(allTransactions[i].rawContract?.address)) > -1 !== false)) {
                            const amountSpent = spentOnGas;

                            // @ts-ignore
                            if (!isComplete(j, k, l) && amountSpent >= parseFloat(step.params.amount)) {
                              // console.log('step completed: spend_gas_amount', step.name, step.points, goal.name, achievement.name, allTransactions[i].hash)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }

                          break;

                        case 'own_token_by_address':

                          // @ts-ignore
                          addresses = convertToLowerCase(step.params.address || address);

                          let tokensFound = 0;

                          // This method checks the ethplorer response and etherscan responses
                          // for the best possible outcome.
                          // Method 1 - ethplorer - We only want to tally this once since we are inside THE LOOP
                          if (i === 0) {
                            if (tokens && tokens.length) {
                              for (let m = 0; m < tokens.length; m++) {
                                const token = tokens[m];
                                if (addresses.indexOf(token.tokenInfo.address) > -1) {
                                  tokensFound++;
                                }
                              }
                            }
                          }


                          // if above method failed, try method #2 - alchemy
                          if (
                            (allTransactions[i].to && addresses.indexOf(convertToLowerCase(allTransactions[i].to)) > -1) || 
                            (allTransactions[i].rawContract?.address && addresses.indexOf(convertToLowerCase(allTransactions[i].rawContract.address)) > -1) ||
                            tokensFound) {

                            if (!ownedTokens[j]) {
                              ownedTokens[j] = [] as Array<Array<number>>;
                            }
                            if (!ownedTokens[j][k]) {
                              ownedTokens[j][k] = [];
                            }
                            if (!ownedTokens[j][k][l]) {
                              ownedTokens[j][k][l] = tokensFound;
                            }
                            // if using method #2 - avoid over counting
                            if (!tokensFound) {
                              ownedTokens[j][k][l]++;
                            }


                            // Danger: `count` in this case is the number of transactions which contain those tokens,
                            // *not* the number of tokens the user owns. Use with caution. 
                            if (ownedTokens[j][k][l] === step.params.count) {
                              // console.warn('step completed: own_token_by_address', step.name, step.points, goal.name, achievement.name)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }

                          break;

                        default:
                          break;
                      }
                    }
                    for (let m = 0; m < progress.length; m++) {
                      if (progress[m][0] === j.toString() && progress[m][1] === k.toString() && progress[m][2] === l.toString()) {
                        completedStepsForThisGoal++;
                      }
                    }
                    if (completedStepsForThisGoal === goal.steps.length) {
                      score += goal.points;
                      markStepCompleted(j, k);
                    }
                  }
                }

                for (let p = 0; p < progress.length; p++) {
                  if (progress[p][0] === j.toString() && progress[p][1] === k.toString() && !progress[p][2]) {
                    // console.log(completedGoalsForThisAchievement, goal.steps.length, goal.name);
                    completedGoalsForThisAchievement++;
                  }
                }
                // if all goals are completed, include achievement points in score
                if (completedGoalsForThisAchievement === achievement.goals.length) {
                  score += achievement.points;
                  // console.warn('achievement completed', achievement.points, achievement.name)
                  completedAchievements++;
                  if (!isComplete(j)) {
                    markStepCompleted(j);
                  }
                }
              }
            }
            // We only want to tally this once since we are inside THE LOOP
            if (i === 0) {
              totalPointsPossible += totalPointsForThisAchievement;
            }
          }
        }
       

        try {
          // update the cache
          const data = {
            address: address.toLowerCase(),
            score,
            name,
            imageUrl: '',
            description: '',
            progress: JSON.stringify(progress),
            season: THIS_SEASON,
            transactions: totalTransactions,
            spentOnGas,
            activeSince
          };

          if (addressCache?.id) {
            const updated = await prisma.address.update({
              where: {
                id: addressCache.id,
              },
              data
            });
          } else {
            const created = await prisma.address.create({
              data
            });
          }
        } catch (e) {
          console.error(e);
        }

      }

      const higherRankedAddresses = await prisma.address.count({
        where: {
          AND: {
            score: {
              gte: score,
            },
            season: THIS_SEASON
          }
        },
      });
      if (higherRankedAddresses) {
        rank = higherRankedAddresses || 0;
      }
    }
  }

  return {
    props: {
      address,
      score: score,
      // totalPointsPossible,
      totalTransactions,
      spentOnGas: spentOnGas.toString(),
      activeSince: activeSince?.toString(),
      rank,
      progress,
      error,
      name
    }
  };

  async function fetchTxns(address: string, network: Network, useTo?: boolean, pageKey?: string, depth: number = 0) {

    let params = {
      fromBlock: "0x0",
      fromAddress: address,
      excludeZeroValue: true,
      category: ["external", "erc20", "erc721", "erc1155"],
      pageKey
    };

    if (useTo) {
      params.toAddress = address;
      params.fromAddress = undefined;
    }
    
    try {
      const results = await alchemy
        .forNetwork(network)
        .core.getAssetTransfers(params);
      
      if (results.pageKey && depth < 2) {
          const nextPage = await fetchTxns(address, network, useTo, results.pageKey, depth + 1);
          results.transfers = results.transfers.concat(nextPage.transfers);
      
      }  

      return results;
    } catch(e) {
      console.log('err', e);
      return new Promise.reject();
    }

  }
}

// we need to distinguish polygon transactions from mainnet
function applyPolygonProperty(transactions: IBlockScoutTx[]) {
  return transactions.map((transaction) => {
    return {
      ...{ chainID: 137 },
      ...transaction
    }
  })
}