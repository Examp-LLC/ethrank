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


import Page from '../components/Page';

const Error = ({ }) => {
  return <Page title="ETHRank - Error">
    <div className="content">
      <div>
        <h1>Error</h1>
        <p>Sorry, you have reached an error. If you feel this problem should be reported to the developers, please let us know using Discord or Telegram.</p>
      </div>
    </div>
  </Page>
}

export default Error