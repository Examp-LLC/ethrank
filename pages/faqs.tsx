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
                <h4>How long do seasons last?</h4>
                <p>ETHRank Seasons currently last 6 months.</p>
            </li>
            <li>
                <h4>Why did my score/rank change?</h4>
                <p>Score and rank are dynamic, and may change with time as new users join the platform, and as additional achievements, goals, and steps are added. Further, balance tweaks to existing points may also be deemed necessary and applied at times. Finally, if a third party API is down or has changed their underlying contract address, some points may be unavailable until the issue is resolved.</p>
            </li>
        </ol>
      </div>
    </div>
  </Page>
}

export default Faqs