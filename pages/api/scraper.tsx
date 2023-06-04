import type { NextApiRequest, NextApiResponse, } from 'next'
import prisma from '../../lib/prisma';
import { Badge } from '../../components/season-two/Badge';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import { generateMetadata } from './checkForNewDynamicMints';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<typeof Badge>
) {
  
  const season = 2;
  const dir = 'badge-output';
  const imageHostUrl = `https://ethrank-badges.s3.amazonaws.com/${season}`;

  const cache = await prisma.badge.findMany({
    where: {
      season
    }
  });

  if (!await fs.existsSync(dir)){
      await fs.mkdirSync(dir);
  }

  if (cache && cache.length) {
    // const limit = 2;
    const limit = cache.length;
    for (let i=0; i<limit; i++) {
      const image = ReactDOMServer.renderToStaticMarkup(Badge({
        score: cache[i].score,
        rank: cache[i].rank,
        address: cache[i].name?.length ? cache[i].name : cache[i].address
      }));
      const metadata = await generateMetadata({
        score: cache[i].score,
        rank: cache[i].rank,
        address: cache[i].name?.length ? cache[i].name : cache[i].address,
        tokenID: cache[i].mint,
        season: season.toString(),
        imageHostUrl
      });

      if (!await fs.existsSync(`${dir}/${cache[i].mint}.svg`)){
        await fs.writeFileSync(`${dir}/${cache[i].mint}.svg`, image);
        await fs.writeFileSync(`${dir}/${cache[i].mint}.json`, JSON.stringify(metadata));
      }
    }
  }
  return res.end();

}
