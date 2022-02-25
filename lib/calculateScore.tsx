import achievements from './achievements.json';
import Web3 from 'web3';
import { PrismaClient } from '@prisma/client';
import { lookupUnstoppableName } from '../pages/unstoppableName/[unstoppableName]';
import { reverseENSLookup, convertToLowerCase } from '../pages/address/[address]';


export async function calculateScore(address: string | string[] | undefined, prisma: PrismaClient, unstoppableName?: string | string[]) {
  let score = 0, rank = 0;
  let totalPointsPossible = 0;
  let completedAchievements = 0;
  let gasSpent = 0;
  let progress: Array<string> = []; // list of completed steps, goals, achievements

  // TODO - useState for the progress above and strongly reconsider data struct
  let sentTransactions = [];
  let receivedTransactions = [];
  let ownedTokens = [];
  let cached = false;
  let error = false;
  let name = '';

  // ERROR case  - /address/something-bad-we-dont-support
  if (address && typeof address === "string" && !Web3.utils.isAddress(address)) {
    error = true;

    // HAPPY PATH - /address/0x53db9542e3a0cdbfebb659d001799ba0b37b2275
  } else if (address) {

    if (Array.isArray(address)) {
      address = address[0];
    }

    const addressCache = await prisma.address.findFirst({
      where: {
        address: address.toLowerCase()
      }
    });

    if (addressCache && !addressCache.active) {
      error = true;
    }

    if (!error) {
      // 24 hours - score cache
      if (addressCache && addressCache.updatedAt > new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) && !process.env.DEVELOPMENT) {
        progress = JSON.parse(addressCache.progress);
        score = addressCache.score;
        name = addressCache.name;
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

      if (!cached || process.env.DEVELOPMENT) {

        if (unstoppableName && typeof unstoppableName === 'string') {
          const unstoppable = await lookupUnstoppableName(unstoppableName.toLowerCase());
          if (unstoppable.address && unstoppable.address.length && unstoppable.address.toLowerCase() === address.toLowerCase()) {
            name = unstoppableName;
          } else {
            error = unstoppable.error;
          }
        } else {
          // ENS stuff - resolve 0x21ada3.. to nick.eth
          const web3 = new Web3('wss://mainnet.infura.io/ws/v3/[your INFURA host]');
          const ensName = await reverseENSLookup(address.toLowerCase(), web3);

          if (ensName) {
            name = ensName;
          }

        }

        const urls = [
          `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=[your API key]`,
          `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=[your API key]`,
          `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=[your API key]`,
          `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=[your API key]`,
          `https://api.etherscan.io/api?module=account&action=getminedblocks&blocktype=blocks&address=${address}&apikey=[your API key]`,
          `https://api.poap.xyz/actions/scan/${address}`
        ];

        const results = await Promise.all(
          urls.map((url) => fetch(url).then((res) => res.json()))
        );

        let transactions = results[0] && typeof results[0].result === "object" && results[0].result;
        const tokens = results[1] && results[1].tokens;
        const erc721Transactions = results[2] && typeof results[2].result === "object" && results[2].result || [];
        const erc20Transactions = results[3] && typeof results[3].result === "object" && results[3].result || [];
        const blocksMined = results[4] && typeof results[4].result === "object" && results[4].result || [];
        const poaps = results[5] && Array.isArray(results[5]) && results[5] || [];

        if (transactions && erc721Transactions) {
          transactions = [...transactions, ...erc721Transactions, ...erc20Transactions];
        }

        const markStepCompleted = (j: any = '', k: any = '', l: any = '') => {
          progress.push(`${j}${k}${l}`);
        };

        const isComplete = (j: any = '', k: any = '', l: any = '') => {
          return progress.indexOf(`${j}${k}${l}`) > -1;
        };

        // THE LOOP - we are only going to loop through all transactions ONCE,
        // so do whatever you need to do in here and before/after.
        for (let i = 0; i < transactions.length; i++) {

          // SCORE = step points + goal points (if all steps complete) + achievement points (if all goals complete)
          for (let j = 0; j < achievements.length; j++) {
            const achievement = achievements[j];

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
                        case 'transaction_to_address_count':

                          // @ts-ignore
                          addresses = convertToLowerCase(step.params.address || address);

                          if (addresses.indexOf(convertToLowerCase(transactions[i].to)) > -1) {
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
                              // console.log('step completed: transaction_to_address_count',   step.name, step.points, goal.name, achievement.name, transactions[i].hash)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }
                          break;

                        case 'transaction_from_address_count':

                          // @ts-ignore
                          addresses = convertToLowerCase(step.params.address || address);
                          if (addresses.indexOf(convertToLowerCase(transactions[i].from)) > -1) {
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

                            // @ts-ignore
                            if (receivedTransactions[j][k][l] === step.params.count) {
                              // console.log('step completed: transaction_from_address_count',  step.name, step.points,goal.name, achievement.name)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }
                          break;

                        case 'send_eth_amount':
                          const amountSent = parseFloat(transactions[i].value) / Math.pow(10, 18);
                          // @ts-ignore
                          if (amountSent >= step.params.amount && transactions[i].contractAddress === "") { // filter out contract transactions
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

                        case 'mine_blocks_count':
                          // We only want to tally this once since we are inside THE LOOP
                          if (i === 0) {
                            // @ts-ignore
                            if (blocksMined && blocksMined.length >= step.params.count) {
                              // console.log('step completed: mine_blocks_count', step.name, step.points, goal.name, achievement.name)
                              markStepCompleted(j, k, l);
                              // if step is completed, include step points in score
                              score += step.points;
                            }
                          }

                          break;

                        case 'spend_gas_amount':
                          // @ts-ignore
                          addresses = convertToLowerCase(step.params.address || address);

                          if (addresses.indexOf(convertToLowerCase(transactions[i].from)) > -1 !== false) {
                            gasSpent += (parseFloat(transactions[i].gasPrice) / Math.pow(10, 18) +
                              parseFloat(transactions[i].cumulativeGasUsed) / Math.pow(10, 18)) *
                              parseFloat(transactions[i].gasUsed);
                            const amountSpent = gasSpent;

                            // @ts-ignore
                            if (amountSpent >= parseFloat(step.params.amount)) {
                              // console.log('step completed: spend_gas_amount', step.name, step.points, goal.name, achievement.name, transactions[i].hash)
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
                                if (addresses.indexOf(token.tokenInfo.address) > -1 !== false) {
                                  tokensFound++;
                                }
                              }
                            }
                          }


                          // if above method failed, try method #2 - etherscan
                          if ((transactions[i].contractAddress && addresses.indexOf(convertToLowerCase(transactions[i].contractAddress)) > -1 !== false) || tokensFound) {

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
                            // @ts-ignore
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
                      // console.warn('goal completed', step.name, goal.points, goal.name, achievement.name)
                      score += goal.points;
                      markStepCompleted(j, k);
                    }
                  }
                }

                for (let p = 0; p < progress.length; p++) {
                  if (progress[p][0] === j.toString() && progress[p][1] === k.toString() && !progress[p][2]) {
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


        // update the cache
        const upsertObj = {
          address: address.toLowerCase(),
          score,
          name,
          imageUrl: '',
          description: '',
          progress: JSON.stringify(progress)
        };
        const cacheUpdated = await prisma.address.upsert({
          where: {
            // @ts-ignore
            address: address.toLowerCase()
          },
          update: upsertObj,
          create: upsertObj
        });

      }

      const higherRankedAddresses = await prisma.address.count({
        where: {
          score: {
            gte: score,
          },
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
      score,
      // totalPointsPossible,
      // totalTransactions: transactions.length,
      rank,
      progress,
      error,
      name
    }
  };
}
