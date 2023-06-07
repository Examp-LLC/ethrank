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

// Season 1
import seasonOneAchievements from './achievements_season1.json';
// Season 2
import seasonTwoAchievements from './achievements_season2.json';
// Season 3
import seasonThreeAchievements from './achievements_season3.json';
// Season 4
import seasonFourAchievements from './achievements_season4.json';

export const CURRENT_SEASON: number = 4;

export const CURRENT_SEASON_ACHIEVEMENTS = getAchievements(CURRENT_SEASON);
export const CURRENT_SEASON_BADGE_ACHIEVEMENT_INDEX = '1111';

interface Achievement {
  name: string;
  points: number;
  slug: string;
  goals: Goal[];
}

interface Goal {
  name: string;
  category: string;
  slug: string;
  points: number;
  steps: Step[];
}

interface Step {
  name: string;
  points: number;
  type: string;
  params: {
    count?: string | number;
    amount?: string | number;
    address?: string | string[];
  };
  url?: string;
}

export function getAchievements(season: number = CURRENT_SEASON): Achievement[] {
  switch (season) {
    case 1:
      return seasonOneAchievements;
    case 2:
      return seasonTwoAchievements;
    case 3:
      return seasonThreeAchievements;
    case 4:
      return seasonFourAchievements;
  }
  return seasonFourAchievements;
}
