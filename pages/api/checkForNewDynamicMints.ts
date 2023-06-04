import prisma from '../../lib/prisma';
import { GenerateNFTParams } from './badges/[season]/[tokenID]';

const dev = process.env.NODE_ENV !== 'production';
const ethrankMintAPIServer = dev ? 'http://localhost:3000' : 'https://mint.ethrank.io';
const ethrankAPIServer = dev ? 'https://www.ethrank.io' : 'https://www.ethrank.io';

export interface GenerateSVGResponseError {
  error: string;
};

export interface GenerateSVGResponseSuccess {
  address: string;
  score: string;
  rank: string;
  metadata: Metadata;
  progress: string[];
};

export interface Attribute {
  trait_type: string;
  value: string | number;
}

export interface Metadata {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[]
}

export interface GenerateMetadataParams {
  address: string;
  season: string;
  tokenID: number;
  score: number;
  rank: number;
  imageHostUrl?: string;
}

export async function getUpdatedScoreAndSaveETHRank(generateNFTParams: GenerateNFTParams): Promise<GenerateSVGResponseSuccess | GenerateSVGResponseError> {

  let {
    tokenID,
    mintAddress,
    rev,
    season,
    existingID,
    name
  } = generateNFTParams;

  const ethrankScore = `${ethrankAPIServer}/api/address/${mintAddress}?season=${season}`

  // @ts-ignore
  const results = await retryFetch(ethrankScore, {}, 10).then((res) => res.json())

  if (!results) {
    return {
      error: 'Failed fetching from ethrank'
    };
  }

  let score = results.score;
  let rank = results.rank;
  let progress = results.progress;
  if (!score) score = 10;
  const metadata = await generateMetadata({
    address: name || mintAddress,
    season,
    tokenID,
    score,
    rank
  });

  // update the db
  const data = {
    mint: tokenID,
    address: mintAddress.toLowerCase(),
    score,
    rank,
    name: name || '',
    seed: 1,
    imageUrl: metadata.image,
    rev,
    version: 1,
    season: parseInt(season, 10)
  };

  try {
    if (typeof existingID !== 'undefined') {
      const updated = await prisma.badge.update({
        where: {
          id: existingID,
        },
        data
      });
    } else {
      const created = await prisma.badge.create({
        data
      });
    }

  } catch (e: any) {
    return {
      error: e?.message
    }
  }
  return {
    score,
    address: mintAddress,
    rank,
    progress,
    metadata
  }

}

export async function generateMetadata(
  {
    address,
    tokenID,
    season,
    rank,
    score,
    imageHostUrl
  }: GenerateMetadataParams
): Promise<Metadata> {
  const image = imageHostUrl ? `${imageHostUrl}/${tokenID}.svg` : `${ethrankMintAPIServer}/api/badges/${season}/${tokenID}.svg`;
  const name = `ETHRank Season ${season} Badge #${tokenID} by ${address}`;
  const description = `${address} is ranked #${rank}, with a score of ${score}. ETHRank is the Ethereum Leaderboard. Check your rank at ETHRank.io.`;

  return {
    name,
    description,
    image,
    attributes: [
      {
        "trait_type": "Score",
        "value": score
      },
      {
        "trait_type": "Rank",
        "value": rank
      },
      {
        "trait_type": "Season",
        "value": season
      },
      {
        "trait_type": "Version",
        "value": "2023.1.0"
      }
    ]
  }
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

const retryFetch = (
  url: string,
  fetchOptions = {},
  retries = 4,
  retryDelay = 2000,
  timeout: number = 0
) => {
  return new Promise((resolve, reject) => {
    // check for timeout
    if (timeout) setTimeout(() => reject('error: timeout'), timeout);

    const wrapper = (n: number) => {
      fetch(url, fetchOptions)
        .then((res) => resolve(res))
        .catch(async (err) => {
          if (n > 0) {
            await delay(retryDelay);
            wrapper(--n);
          } else {
            reject(err);
          }
        });
    };

    wrapper(retries);
  });
};
