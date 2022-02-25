// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma';
import { AddressProps } from "../../../pages/address/[address]"
import { calculateScore } from "../../../lib/calculateScore";

type Data = {
  score: number,
  rank: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const { address } = req.query;
  const { props } = await calculateScore(address, prisma);
  const { score, rank } = props;
  res.status(200).json({ score, rank })
}
