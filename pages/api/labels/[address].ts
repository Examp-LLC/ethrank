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
import Cors from 'cors';
import initMiddleware from '../../../lib/init-middleware';
import { CURRENT_SEASON } from '../../../lib/constants';
import { getRateLimitMiddlewares } from '../../../lib/rateLimit';
import { convertToLowerCase } from '../../address/[address]';
import { Address } from '@prisma/client';
import season1Achievements from '../../../lib/achievements_season1.json';
import season2Achievements from '../../../lib/achievements_season2.json';
import season3Achievements from '../../../lib/achievements_season3.json';
import season4Achievements from '../../../lib/achievements_season4.json';
import season5Achievements from '../../../lib/achievements_season5.json';
import { getCalcMethod } from '../address/[address]';

const achievements = [
  season1Achievements,
  season2Achievements,
  season3Achievements,
  season4Achievements,
  season5Achievements
];

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
  res: NextApiResponse<Data | String>
) {

  try {
    await Promise.all(
      middlewares.map(middleware => middleware(req, res))
    )
  } catch {
    return res.status(429).send(`Too Many Requests`)
  }

  const { address } = req.query;
  if (!address || typeof address !== 'string') return res.status(500);

  const labels = await getLabelsForAddress(address, true);

  return res.status(200).json(labels);
}

export async function getLabelsForAddress(address: string, forceCalcScore:boolean = false) {
  // fetch updated score for this season in case people hit this API directly with a fresh address
  if (forceCalcScore) {
    let calcScoreForCurrentSeason = getCalcMethod(CURRENT_SEASON);
    await calcScoreForCurrentSeason(address, prisma);
  }

  const allSeasonScores = await prisma.address.findMany({
    where: {
      address: {
        equals: convertToLowerCase(address),
      }
    },
    orderBy: {
      season: 'asc',
    }
  });

  if (allSeasonScores) {
    const allSeasonLabels = allSeasonScores.map(({ progress, season }: Address) => {
      const labels = JSON.parse(progress).map((step: string) => {
        // We currently only return goals completed,
        // discarding achievements (too few) and steps (too many)
        if (step.length === 2) {
          const label = achievements[season - 1][Number(step[0])].goals[Number(step[1])];
          return label;
        }
      }).filter(Boolean);
      return labels;
    })
    return allSeasonLabels.flat()
  }
}