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

export interface Achievement {
    name:      string;
    goals:    Goal[];
    points:    number;
}

export interface Goal {
    name:      string;
    category:  Category;
    slug:      string;
    points:    number;
    steps:     Step[];
}

export enum Category {
    Defi = "defi",
    Nfts = "nfts",
    Reputation = "reputation",
    Staking = "staking",
    Finance = "finance",
    Social = "social",
    Collecting = "collecting",
    Technology = "technology",
}

export interface Step {
    name:   string;
    points: number;
    type:   StepType;
    params: Params;
    url?:   string;
}

export interface Params {
    count?:   number;
    amount?:  number | string;
    address?: string[] | string;
}

export enum StepType {
    OwnPoapCount = "own_poap_count",
    OwnTokenByAddress = "own_token_by_address",
    OwnTokenCount = "own_token_count",
    SendEthAmount = "send_eth_amount",
    SpendGasAmount = "spend_gas_amount",
    TransactionFromAddressCount = "transaction_from_address_count",
    TransactionToAddressCount = "transaction_to_address_count",
}