import type { NextApiRequest, NextApiResponse, } from 'next'
import prisma from '../../../../lib/prisma';
import { checkAndGenerateBadge } from '../../../../lib/utilities';

const dev = process.env.NODE_ENV !== 'production';

export type Metadata = {
  image: string;
  name: string;
  description: string;
}

export type Transaction = {
  tokenID: string;
  to: string;
}

export type BadgeProps = {
  address: string;
  score: number;
  rank: number;
  error?: boolean;
}

export interface GenerateNFTParams {
  tokenID: number;
  mintAddress: string; 
  rev: number;
  season: string;
  errorCount?: number;
  existingID?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=43200, stale-while-revalidate=86400'
  )

  const { tokenID, season } = req.query;
  if (!tokenID || typeof tokenID !== 'string') return;
  if (!season || typeof season !== 'string') return;
  const id = tokenID.replace('.json', '');
  const { props } = await checkAndGenerateBadge(id, season, prisma);
  if (props.error) {
    res.status(404).send(props.error)
  }
  return res.status(200).json(props.metadata)
}
