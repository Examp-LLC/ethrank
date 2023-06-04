import { BadgeDefault } from "./BadgeDefault";
import { BadgeFirst } from "./BadgeFirst";
import { BadgeSecond } from "./BadgeSecond";
import { BadgeThird } from "./BadgeThird";
import { BadgeTop100 } from "./BadgeTop100";

export interface BadgeParams {
  address: string;
  score: number;
  rank: number;
}

export const Badge = ({ address, score, rank }: BadgeParams) => {
  if (rank === 1) {
    return (<BadgeFirst address={address} score={score} rank={rank} />)
  } else if (rank === 2) {
    return (<BadgeSecond address={address} score={score} rank={rank} />)
  } else if (rank === 3) {
    return (<BadgeThird address={address} score={score} rank={rank} />)
  } else if (rank <= 100) {
    return (<BadgeTop100 address={address} score={score} rank={rank} />)
  } else {
    return (<BadgeDefault address={address} score={score} rank={rank} />)
  }
};