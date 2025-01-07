import type { NextApiRequest, NextApiResponse, } from 'next'
import prisma from '../../../../lib/prisma';
import { Badge as SeasonOneBadge, Badge } from '../../../../components/season-one/Badge';
import { Badge as SeasonTwoBadge } from '../../../../components/season-two/Badge';
import { Badge as SeasonThreeBadge } from '../../../../components/season-three/Badge';
import { Badge as SeasonFourBadge } from '../../../../components/season-four/Badge';
import { Badge as SeasonFiveBadge } from '../../../../components/season-five/Badge';
import ReactDOMServer from 'react-dom/server';
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
  name?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<typeof Badge>
) {
  const { tokenID, season } = req.query;
  if (!tokenID || typeof tokenID !== 'string') return;
  if (!season || typeof season !== 'string') return;
  const id = tokenID.replace('.svg', '');
  const { props } = await checkAndGenerateBadge(id, season, prisma);
  if (props.error) {
    return res.status(404).send(props.error)
  }

  // @ts-ignore
  const image = ReactDOMServer.renderToStaticMarkup(getCurrentSeasonBadge(season, props));

  res.writeHead(200, {
    'Content-Type': 'image/svg+xml;charset=utf-8',
    'Content-Length': new TextEncoder().encode(image).length,
    'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
    'Access-Control-Allow-Origin': '*'
  });
  return res.end(image)
}

// @ts-ignore
const getCurrentSeasonBadge = (season, props) => {
  switch (Number(season)) {
    case 1:
      return SeasonOneBadge(props)
    case 2:
      return SeasonTwoBadge(props)
    case 3:
      return SeasonThreeBadge(props)
    case 4:
      return SeasonFourBadge(props)
    case 5:
      return SeasonFiveBadge(props)
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
}