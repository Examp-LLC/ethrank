/*
 * All content copyright 2022 Examp, LLC
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

export const CURRENT_SEASON: number = 3;

export const CURRENT_SEASON_ACHIEVEMENTS = getAchievements();

export function getAchievements(season:number = CURRENT_SEASON) {
  switch (season) {
    case 1:
      return seasonOneAchievements;
    case 2:
      return seasonTwoAchievements;
    case 3:
      return seasonThreeAchievements;
  }
  return seasonOneAchievements;
}
