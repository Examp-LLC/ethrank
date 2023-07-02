import { BadgeDefault } from "./BadgeDefault";

export interface BadgeParams {
  address: string;
  score: number;
  rank: number;
  progress?: string[];
}

export const Badge = ({ address, score, rank, progress }: BadgeParams) => {
  // if (progress && progress?.indexOf('400') > -1 && progress?.indexOf('401') > -1) {
  //   return (<BadgeElite address={address} score={score} rank={rank} />)
  // } else if (rank <= 100) {
  //   return (<BadgeTop100 address={address} score={score} rank={rank} />)
  // } else if (rank <= 500) {
  //   return (<BadgeTop500 address={address} score={score} rank={rank} />)
  // } else if (rank <= 1000) {
  //   return (<BadgeTop1000 address={address} score={score} rank={rank} />)
  // } else {
    return (<BadgeDefault address={address} score={score} rank={rank} />)
  // }
};