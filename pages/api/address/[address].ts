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

import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma';
import { calculateScore as calculateScoreSeasonOne } from "../../../lib/calculateScore_season1";
import { calculateScore as calculateScoreSeasonTwo } from "../../../lib/calculateScore_season2";
import { calculateScore as calculateScoreSeasonThree } from "../../../lib/calculateScore_season3";
import { calculateScore as calculateScoreSeasonFour } from "../../../lib/calculateScore_season4";
import { calculateScore as calculateScoreSeasonFive } from "../../../lib/calculateScore_season5";
import Cors from 'cors';
import initMiddleware from '../../../lib/init-middleware';
import { CURRENT_SEASON } from '../../../lib/constants';
import { getRateLimitMiddlewares } from '../../../lib/rateLimit';

type Data = {
  score: number;
  rank: number;
  progress: string[];
  activeSince?: string;
  spentOnGas?: string;
  totalTransactions?: number;
}

const middlewares = [
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'OPTIONS'],
  }),
  ...getRateLimitMiddlewares()
].map(initMiddleware)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data|String>
) {

  try {
    await Promise.all(
      middlewares.map(middleware => middleware(req, res))
    )
  } catch {
    return res.status(429).send(`Too Many Requests`)
  }

  const { address, season, extended } = req.query;
  if (!address || typeof address !== 'string') return;
  if (season && typeof season !== 'string') return;
  let calcScore = getCalcMethod(season);
  // @ts-ignore
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
    case 4:
      seasonScoringMethod = calculateScoreSeasonFour
      break;
    case 5:
      seasonScoringMethod = calculateScoreSeasonFive
      break;
    default:
      seasonScoringMethod = calculateScoreSeasonOne
      break;
  }
  return seasonScoringMethod;
}