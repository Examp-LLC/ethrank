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

import { AlchemyMultichainClient } from './alchemy-multichain-client';
import { Network } from 'alchemy-sdk';
import { getChainData } from './utilities';


const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const ETHPLORER_API_KEY = process.env.ETHPLORER_API_KEY;
const POAP_API_KEY = process.env.POAP_API_KEY;
const ALCHEMY_ETH_MAINNET_KEY = process.env.ALCHEMY_ETH_MAINNET_KEY;
const ALCHEMY_MATIC_MAINNET_KEY = process.env.ALCHEMY_MATIC_MAINNET_KEY;
const ALCHEMY_ARB_MAINNET_KEY = process.env.ALCHEMY_ARB_MAINNET_KEY;
const ALCHEMY_OP_MAINNET_KEY = process.env.ALCHEMY_OP_MAINNET_KEY;

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
  console.time('calculateScore');
  let score = 0, rank = 0;
  let totalPointsPossible = 0;
  let completedAchievements = 0;
  let totalTransactions = 0;
  let spentOnGas = 0;
  let activeSince: Date | null = null;
  let progress: string[] = []; // list of completed steps, goals, achievements

  // TODO - useState for the progress above and strongly reconsider data struct
  let sentTransactions = [];
  let receivedTransactions = [];
  let ownedTokens = [];
  let ownedPolygonTokens = [];
  let deployedContracts = [];
  let cached = false;
  let error = false;
  let name = '';
  let transactionHashes = [];
  let isDupeTransaction = false;
  let THIS_SEASON = 5;
  let ACHIEVEMENTS = getAchievements(THIS_SEASON);

  const defaultConfig = {
    apiKey: ALCHEMY_ETH_MAINNET_KEY,
    network: Network.ETH_MAINNET
  };
  const overrides = {
    [Network.MATIC_MAINNET]: { apiKey: ALCHEMY_MATIC_MAINNET_KEY, maxRetries: 10 },
    [Network.ARBITRUM_MAINNET]: { apiKey: ALCHEMY_ARB_MAINNET_KEY, maxRetries: 10 },
    [Network.OP_MAINNET]: { apiKey: ALCHEMY_OP_MAINNET_KEY, maxRetries: 10 },
    [Network.BASE_MAINNET]: { apiKey: ALCHEMY_ETH_MAINNET_KEY, maxRetries: 10 }
    // [Network.LINEA_MAINNET]: { apiKey: ALCHEMY_ETH_MAINNET_KEY, maxRetries: 10 },
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
      console.time('cacheCheck');
      // store in cache for 24 hours
      if (addressCache && 
          addressCache.updatedAt > new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) && 
          !process.env.DEVELOPMENT) {
        progress = JSON.parse(addressCache.progress);
        score = addressCache.score;
        name = addressCache.name;
        totalTransactions = addressCache.transactions || 0;
        spentOnGas = Number(addressCache.spentOnGas) || 0;
        activeSince = addressCache.activeSince || null;
        cached = true;
      }
      console.timeEnd('cacheCheck');

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
        console.time('fetchData');
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
        
        const [
            mainnetTxns,
            mainnetTxnsTo,
            maticTxns,
            maticTxnsTo,
            arbitrumTxns,
            arbitrumTxnsTo,
            opTxns,
            opTxnsTo,
            baseTxns,
            baseTxnsTo
        ] = await Promise.all([
            fetchTxns(address, Network.ETH_MAINNET),
            fetchTxns(address, Network.ETH_MAINNET, true),
            fetchTxns(address, Network.MATIC_MAINNET),
            fetchTxns(address, Network.MATIC_MAINNET, true),
            fetchTxns(address, Network.ARB_MAINNET),
            fetchTxns(address, Network.ARB_MAINNET, true),
            fetchTxns(address, Network.OPT_MAINNET),
            fetchTxns(address, Network.OPT_MAINNET, true),
            fetchTxns(address, Network.BASE_MAINNET),
            fetchTxns(address, Network.BASE_MAINNET, true)
        ]);

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
        
        const poaps = results[1] && Array.isArray(results[1]) && results[1] || [];

        if (!mainnetTxns) {
          console.log(`Error fetching upstream data, trying again 
          Mainnet txns: ${mainnetTxns.transfers?.length} 
          Matic txns: ${maticTxns.transfers?.length}
          Arbitrum txns: ${arbitrumTxns.transfers?.length}
          Optimism txns: ${opTxns.transfers?.length}
          Base txns: ${baseTxns.transfers?.length}
          POAPS: ${poaps.length}
          ${attempts} attempts` )
          attempts = attempts + 1;
          if (attempts < 5) {
            return calculateScore(address, prisma, unstoppableName, attempts);
          } else {
            throw new Error('Unable to calculate score');
          }
        }

        const allTransactions = [
          ...mainnetTxns.transfers || [],
          ...mainnetTxnsTo.transfers || [],
          ...applyNetworkName(maticTxns.transfers || [], Network.MATIC_MAINNET),
          ...applyNetworkName(maticTxnsTo.transfers || [], Network.MATIC_MAINNET),
          ...applyNetworkName(arbitrumTxns.transfers || [], Network.ARB_MAINNET),
          ...applyNetworkName(arbitrumTxnsTo.transfers || [], Network.ARB_MAINNET),
          ...applyNetworkName(opTxns.transfers || [], Network.OPT_MAINNET),
          ...applyNetworkName(opTxnsTo.transfers || [], Network.OPT_MAINNET),
          ...applyNetworkName(baseTxns.transfers || [], Network.BASE_MAINNET),
          ...applyNetworkName(baseTxnsTo.transfers || [], Network.BASE_MAINNET),
          // ...applyNetworkName(lineaTxns.transfers || [], Network.LINEA_MAINNET),
          // ...applyNetworkName(lineaTxnsTo.transfers || [], Network.LINEA_MAINNET),
        ];

        totalTransactions = allTransactions.length;
        if (totalTransactions) {
          let firstBlock = await alchemy
            .forNetwork(allTransactions[0].network || Network.ETH_MAINNET)
            .core
            .getBlock(allTransactions[0].blockNum);
          if (firstBlock) {
            activeSince = new Date(firstBlock.timestamp * 1000);
          } else {
            activeSince = new Date();
          }
        }

        const markStepCompleted = (j: any = '', k: any = '', l: any = '') => {
          progress.push(`${j}${k}${l}`);
        };

        const isComplete = (j: any = '', k: any = '', l: any = '') => {
          return progress.indexOf(`${j}${k}${l}`) > -1;
        };

        console.timeEnd('fetchData');

        console.time('processTransactions');
        // THE LOOP - we are only going to loop through all transactions ONCE,
        // so do whatever you need to do in here and before/after.
        for (let i = 0; i < allTransactions.length; i++) {

          // skip failed txs
          if (allTransactions[i]?.isError === "1" || !allTransactions[i]) {
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


          if (!isDupeTransaction && !allTransactions[i].network) {
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

                    if (!isComplete(j, k, l)) {

                      switch (step.type) {
                        // Check if the transaction was sent to the specified address and count it
                        case 'transaction_to_address_count':
                          // Convert the address to lowercase for comparison
                          // Check if the transaction was sent to the specified address
                          // If so, increment the count of sent transactions for this achievement
                          // If the count matches the required count, mark the step as completed and add points to the score
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
                              markStepCompleted(j, k, l);
                              score += step.points;
                            }
                          }
                          break;

                        // Check if the transaction was received from the specified address and count it
                        case 'transaction_from_address_count':
                          // Convert the address to lowercase for comparison
                          // Check if the transaction was received from the specified address
                          // If so, increment the count of received transactions for this achievement
                          // If the count matches the required count, mark the step as completed and add points to the score
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
                              markStepCompleted(j, k, l);
                              score += step.points;
                            }
                          }
                          break;

                        // Check if the user sent a specified amount of ETH
                        case 'send_eth_amount':
                          // Skip counting if the transaction is a duplicate or from a sidechain
                          // Check if the amount sent meets the required amount for this step
                          // If so, mark the step as completed and add points to the score
                          if (isDupeTransaction || allTransactions[i].network) continue;
                          
                          const amountSent = allTransactions[i].value;
                          // @ts-ignore
                          if (amountSent >= step.params.amount && (allTransactions[i].category === "external" || allTransactions[i].category === "internal")) {
                            markStepCompleted(j, k, l);
                            score += step.points;
                          }
                          break;

                        // Check if the user owns a specified number of tokens
                        case 'own_token_count':
                          // Only tally this once since we are inside THE LOOP
                          // Check if the user owns the required number of tokens for this achievement
                          // If so, mark the step as completed and add points to the score
                          if (i === 0) {
                            // @ts-ignore
                            if (tokens && tokens.length >= step.params.count) {
                              markStepCompleted(j, k, l);
                              score += step.points;
                            }
                          }
                          break;

                        // Check if the user owns a specified number of POAPs
                        case 'own_poap_count':
                          // Only tally this once since we are inside THE LOOP
                          // Check if the user owns the required number of POAPs for this achievement
                          // If so, mark the step as completed and add points to the score
                          if (i === 0) {
                            // @ts-ignore
                            if (poaps && poaps.length >= step.params.count) {
                              markStepCompleted(j, k, l);
                              score += step.points;
                            }
                          }
                          break;
                          
                        // Check if the user deployed a contract
                        case 'deploy_contract_count':

                          // Check if the transaction is a contract deployment by the user
                          if (allTransactions[i].to === null && convertToLowerCase(allTransactions[i].from) === address.toLowerCase()) {
                            deployedContracts.push(allTransactions[i]);
                            if (deployedContracts.length  >= step.params.count) {
                              markStepCompleted(j, k, l);
                              score += step.points;
                            }
                          }
                          break;

                        // Check if the user spent a specified amount of gas
                        case 'spend_gas_amount':
                          // Skip counting if the transaction is a duplicate or from a sidechain
                          // Check if the user has spent the required amount of gas for this step
                          // If so, mark the step as completed and add points to the score
                          if (isDupeTransaction || allTransactions[i].network) continue;

                          addresses = convertToLowerCase(address);
                          if ((addresses.indexOf(convertToLowerCase(allTransactions[i].from)) > -1 !== false) ||
                              (allTransactions[i].rawContract?.address && addresses.indexOf(convertToLowerCase(allTransactions[i].rawContract?.address)) > -1 !== false)) {
                            const amountSpent = spentOnGas;

                            // @ts-ignore
                            if (!isComplete(j, k, l) && amountSpent >= parseFloat(step.params.amount)) {
                              markStepCompleted(j, k, l);
                              score += step.points;
                            }
                          }
                          break;

                        // Check if the user owns tokens from a specified address
                        case 'own_token_by_address':
                          // Convert the address to lowercase for comparison
                          // Check if the user owns tokens from the specified address
                          // If so, increment the count of owned tokens for this achievement
                          // If the count matches the required count, mark the step as completed and add points to the score
                          // @ts-ignore
                          addresses = convertToLowerCase(step.params.address || address);
                          let tokensFound = 0;

                          // Method 1 - Check ethplorer response
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
        console.timeEnd('processTransactions');

        console.time('updateCache');
        try {
          // update the cache
          const data = {
            address: address.toLowerCase(),
            score,
            season: THIS_SEASON,
            progress: JSON.stringify(progress),
            name,
            imageUrl: '',
            description: '',
            active: true,
            featured: false,
            transactions: totalTransactions,
            spentOnGas: spentOnGas ? new Prisma.Decimal(spentOnGas) : null,
            activeSince: activeSince || undefined
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
        console.timeEnd('updateCache');

      }

      console.time('calculateRank');
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
      console.timeEnd('calculateRank');
    }
  }

  console.timeEnd('calculateScore');
  return {
    props: {
      address,
      score: score,
      totalTransactions,
      spentOnGas: spentOnGas.toString(),
      activeSince: activeSince?.toISOString() || null,
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
      excludeZeroValue: false,
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
      return [];
    }

  }
}

// we need to distinguish polygon transactions from mainnet
function applyNetworkName(transactions: IBlockScoutTx[], network: keyof typeof Network) {
  return transactions.map((transaction) => {
    return {
      ...{ network },
      ...transaction
    }
  })
}