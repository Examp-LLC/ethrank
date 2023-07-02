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


import * as Networks from './Networks';

interface SaleConfig {
  price: number;
  maxMintAmountPerTx: number;
};

interface NetworkConfigInterface {
  chainId: number;
  symbol: string;
  blockExplorer: {
    name: string;
    generateContractUrl: (contractAddress: string) => string;
  };
};

interface CollectionConfigInterface {
  currentSeason: number;
  testnet: NetworkConfigInterface;
  mainnet: NetworkConfigInterface;
  contractName: string;
  tokenName: string;
  tokenSymbol: string;
  hiddenMetadataUri: string;
  maxSupply: number;
  whitelistSale: SaleConfig;
  preSale: SaleConfig;
  publicSale: SaleConfig;
  contractAddress: `0xstring`[] | string[];
  marketplaceIdentifier: string;
};


const CollectionConfig: CollectionConfigInterface = {
  currentSeason: 4,
  testnet: Networks.ethereumTestnet,
  mainnet: Networks.ethereumMainnet,
  contractName: 'ETHRankBadge',
  tokenName: 'ETHRankBadge',
  tokenSymbol: 'RANK',
  hiddenMetadataUri: 'ipfs://__CID__/hidden.json',
  maxSupply: 5000,
  whitelistSale: {
    price: 0.025,
    maxMintAmountPerTx: 1,
  },
  preSale: {
    price: 0.025,
    maxMintAmountPerTx: 1,
  },
  publicSale: {
    price: 0.05,
    maxMintAmountPerTx: 1,
  },
  contractAddress: [
    '0x26adbb495c1a66238e4155e407e0702ffec03df2', // season 0
    // '0x26AdbB495C1A66238e4155E407E0702FFeC03dF2', // Season 1 (testnet)
    '0x26adbb495c1a66238e4155e407e0702ffec03df2', // Season 1 (mainnet)
    '0xE372C0922305aCEC60172307c924c6fEfe4Db874', // Season 2 (mainnet)
    '0x55efC18B06D455bff9830969b0F9935052aD63C2', // Season 3 (mainnet)
    '0x8DfbeE5338a012Ce7746bDE4428c9d9df87a6C5E', // Season 4 (mainnet)
  ],
  marketplaceIdentifier: 'opensea',
};

export default CollectionConfig;
