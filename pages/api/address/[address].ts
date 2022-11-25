/*
 * All content copyright 2022 Examp, LLC
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

import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma';
import { calculateScore as calculateScoreSeasonOne } from "../../../lib/calculateScore_season1";
import { calculateScore as calculateScoreSeasonTwo } from "../../../lib/calculateScore_season2";
import { calculateScore as calculateScoreSeasonThree } from "../../../lib/calculateScore_season3";
import Cors from 'cors';
import initMiddleware from '../../../lib/init-middleware';
import { CURRENT_SEASON } from '../../../lib/constants';

type Data = {
  score: number;
  rank: number;
  progress: string[];
  activeSince?: string;
  spentOnGas?: string;
  totalTransactions?: number;
}

// Initialize the cors middleware
const cors = initMiddleware(
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'OPTIONS'],
  })
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  // Run cors
  await cors(req, res)

  const { address, season, extended } = req.query;
  if (!address || typeof address !== 'string') return;
  if (season && typeof season !== 'string') return;
  let calcScore = getCalcMethod(season);
  const { props } = await calcScore(address, prisma);
  const { score, rank, progress, activeSince, spentOnGas, totalTransactions } = props;
  if (extended) {
    res.status(200).json({ score, rank, progress, activeSince, spentOnGas, totalTransactions })
  } else {
    res.status(200).json({ score, rank, progress })
  }
}

export function getCalcMethod (season: string|number = CURRENT_SEASON) {
  let seasonScoringMethod;
  switch (Number(season)){
    case 1:
      seasonScoringMethod = calculateScoreSeasonOne
      break;
    case 2:
      seasonScoringMethod = calculateScoreSeasonTwo
      break;
    case 3:
      seasonScoringMethod = calculateScoreSeasonThree
      break;
    default:
      seasonScoringMethod = calculateScoreSeasonOne
      break;
  }
  return seasonScoringMethod;
}