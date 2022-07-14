/*
 * All content copyright 2022 Examp, LLC
 *
 * This file is part of some open source application.
 * 
 * Some open source application is free software: you can redistribute 
 * it and/or modify it under the terms of the GNU General Public 
 * License as published by the Free Software Foundation, either 
 * version 3 of the License, or (at your option) any later version.
 * 
 * Some open source application is distributed in the hope that it will 
 * be useful, but WITHOUT ANY WARRANTY; without even the implied warranty 
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
*/

import Page from '../components/Page';

const Faqs = ({  }) => {
  return <Page title="ETHRank - FAQs">
    <div className="content">
      <div>
        <h3>Frequently Asked Questions</h3>
        <ol>
            <li>
                <h4>How are scores calculated?</h4>
                <p>Scores are calculated using a point system, where points are awarded for completing steps, goals, and achievements. As steps are completed, points are added to your Score. If all steps of a goal are completed, then the points for that goal will be awarded. Similarly, if all goals for an achievement are completed, then additional bonus points may be added to your Score.</p>
            </li>
            <li>
                <h4>When does Season 2 end and/or when does Season 3 begin?</h4>
                <p>ETHRank Seasons currently last 6 months. Season Two ends on December 31, 2022, and Season Three begins the next day, on January 1, 2023. We may adjust this duration during the course of the season. If we do, we will provide as much notice as possible to our users.</p>
            </li>
            <li>
                <h4>Why did my score/rank change?</h4>
                <p>Score and rank are dynamic, and will change with time as new users join the platform, and as additional achievements, goals, and steps are added. Further, balance tweaks to existing points may also be deemed necessary and applied at times.</p>
            </li>
            <li>
                <h4>Will there be a token/airdrop/NFT rewards for completing goals/achievements?</h4>
                <p>Anything is possible. If you have ideas along these lines, please join our community!</p>
            </li>
        </ol>
      </div>
    </div>
  </Page>
}

export default Faqs