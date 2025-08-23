import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma';
import Cors from 'cors';
import initMiddleware from '../../../lib/init-middleware';
import { getRateLimitMiddlewares } from '../../../lib/rateLimit';
import { CURRENT_SEASON } from '../../../lib/constants';
import { calculateScore as calculateScoreSeasonOne } from "../../../lib/calculateScore_season1";
import { calculateScore as calculateScoreSeasonTwo } from "../../../lib/calculateScore_season2";
import { calculateScore as calculateScoreSeasonThree } from "../../../lib/calculateScore_season3";
import { calculateScore as calculateScoreSeasonFour } from "../../../lib/calculateScore_season4";
import { calculateScore as calculateScoreSeasonFive } from "../../../lib/calculateScore_season5";

const middlewares = [
  Cors({
    methods: ['POST', 'OPTIONS'],
  }),
  ...getRateLimitMiddlewares()
].map(initMiddleware)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await Promise.all(
      middlewares.map(middleware => middleware(req, res))
    )
  } catch {
    return res.status(429).send(`Too Many Requests`)
  }

  const { address: bodyAddress, season } = req.body;
  const urlAddress = req.query.address as string;
  
  // Use address from URL path if not in body
  const address = bodyAddress || urlAddress;
  
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const seasonNum = season ? parseInt(season) : 5; // Default to current season

      try {
    
    // Check if calculation is already in progress for this address/season
    const existingCalculation = await prisma.address.findFirst({
      where: {
        address: address.toLowerCase(),
        season: seasonNum
      }
    });

    // If we have a recent calculation (within 24 hours for production, 1 hour for development), calculate rank and return
    const cacheHours = process.env.NODE_ENV === 'development' ? 1 : 24;
    if (existingCalculation && 
        existingCalculation.updatedAt > new Date(Date.now() - cacheHours * 60 * 60 * 1000)) {
      
      // Calculate rank for cached result
      const higherRankedAddresses = await prisma.address.count({
        where: {
          AND: {
            score: {
              gte: existingCalculation.score,
            },
            season: seasonNum
          },
        },
      });

      const rank = higherRankedAddresses || 0;
      
      return res.status(200).json({
        status: 'completed',
        data: {
          address: existingCalculation.address,
          score: existingCalculation.score,
          rank: rank,
          progress: JSON.parse(existingCalculation.progress),
          name: existingCalculation.name,
          totalTransactions: existingCalculation.transactions || 0,
          spentOnGas: existingCalculation.spentOnGas?.toString() || '0',
          activeSince: existingCalculation.activeSince?.toISOString() || null
        }
      });
    }

    // If no existing record or it's old, start calculation
    let calcScore = getCalcMethod(seasonNum.toString());
    
    // Perform the calculation
    const result = await calcScore(address, prisma);
    
    if (result.props.error) {
      return res.status(500).json({ 
        status: 'error', 
        error: 'Failed to calculate score' 
      });
    }

    // Calculate rank
    const higherRankedAddresses = await prisma.address.count({
      where: {
        AND: {
          score: {
            gte: result.props.score,
          },
          season: seasonNum
        }
      },
    });

    const rank = higherRankedAddresses || 0;

    return res.status(200).json({
      status: 'completed',
      data: {
        ...result.props,
        rank
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      status: 'error', 
      error: 'Internal server error',
      details: (error as any).message
    });
  }
}

function getCalcMethod (season: string|number = CURRENT_SEASON) {
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
