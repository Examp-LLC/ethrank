import type { NextApiRequest, NextApiResponse, } from 'next'
import prisma from '../../lib/prisma';
import { Badge } from '../../components/season-three/Badge';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import { generateMetadata } from './checkForNewDynamicMints';

const dev = process.env.NODE_ENV !== 'production';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (!dev) return res.end();

  console.log('starting download');

  const season = 4;
  const dir = 'badge-output';
  const imageHostUrl = `https://ethrank-badges.s3.amazonaws.com/${season}`;

  const cache = await prisma.badge.findMany({
    where: {
      season
    }
  });

  console.log('Cache length:', cache.length);

  if (!await fs.existsSync(dir)){
      console.log('Directory does not exist, creating:', dir);
      await fs.mkdirSync(dir);
  } else {
      console.log('Directory already exists:', dir);
  }

  if (cache && cache.length) {
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

      const svgPath = `${dir}/${cache[i].mint}.svg`;
      const jsonPath = `${dir}/${cache[i].mint}.json`;

      if (!await fs.existsSync(svgPath)){
        console.log('Writing SVG file:', svgPath);
        await fs.writeFileSync(svgPath, image);
      } else {
        console.log('SVG file already exists:', svgPath);
      }

      if (!await fs.existsSync(jsonPath)){
        console.log('Writing JSON file:', jsonPath);
        await fs.writeFileSync(jsonPath, JSON.stringify(metadata));
      } else {
        console.log('JSON file already exists:', jsonPath);
      }
    }
  } else {
    console.log('No cache data found for season:', season);
  }

  console.log('finished successfully');
  res.end();
}
