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

const APIDocs = ({ }) => {
  return <Page title="ETHRank - API Documentation">
    <div className="content">
      <div>
        <h3>ETHRank API Documentation</h3>
        <h4>Get ETHRank and Score for a Single Address</h4>
        <p>Returns the ETHRank and score of a given address in JSON format.</p>
        <pre>
          https://ethrank.io/api/address/[address]
        </pre>
        <p>Try this endpoint in your <a href="https://ethrank.io/api/address/0xfe6b2924685dc14cd3ea4688539de5307c40312a">browser 🔗</a>.</p>
        <h5>Sample Response</h5>
        <pre>
          {`{"score":610,"rank":1151,"progress":["040","111","146","240","041","042","04","001"]}`}
        </pre>
        <h4>How to use this API</h4>
        <table>
          <tr>
            <td>score</td>
            <td>The cumulative score calculated by the sum of all steps, goals and acheivements completed.</td>
          </tr>
          <tr>
            <td>rank</td>
            <td>The current rank of the user for this season (1=top score)</td>
          </tr>
          <tr>
            <td>progress</td>
            <td>A string array mapping to the indexes of the steps, goals and achievements in the <a href="https://github.com/Examp-LLC/ethrank/blob/main/lib/achievements_season2.json">JSON definition</a> for the current season.<br /><br />
              Example: <strong>000</strong><br />
              0 - First Achievement in the list <br />
              0 - First Goal in the First Achievement <br />
              0 - First Step in the Second Goal of the First Achievement<br /><br />

              Using the Season 2 JSON definitions as an example, this user has completed the &quot;Own 1 Metagon&quot; Step of the &quot;ETHRank Supporter&quot; Goal which is part of the &quot;The Enthusiast&quot; Achievement.
            </td>
          </tr>
        </table>
        <h4>Get Labels for a Single Address</h4>
        <p>Returns labels for spanning all seasons of a given address in JSON format.</p>
        <pre>
          https://ethrank.io/api/labels/[address]
        </pre>
        <p>Try this endpoint in your <a href="https://ethrank.io/api/labels/0xfe6b2924685dc14cd3ea4688539de5307c40312a">browser 🔗</a>.</p>
        <h5>Sample Response</h5>
        <pre>
          {`[{
  "name": "ETHRank Elite",
  "slug": "ethrank-elite",
  "category": "reputation",
  "points": 50,
  "steps": [
  {
    "name": "Own 1 ETHRank Season 1 Badge",
    "points": 50,
    "type": "own_token_by_address",
    "params": {
      "count": 1,
      "address": "0x26AdbB495C1A66238e4155E407E0702FFeC03dF2"
    }
  }
]}]`}
        </pre>
        <h4>How to use this API</h4>
        <table>
          <tr>
            <td>name</td>
            <td>The name of the achievement, goal, or step</td>
          </tr>
          <tr>
            <td>slug</td>
            <td>A search-engine-friendly version of the name</td>
          </tr>
          <tr>
            <td>category</td>
            <td>The corresponding ETHRank category for this achievement
            </td>
          </tr>
          <tr>
            <td>points</td>
            <td>The number of points awarded for this achievement
            </td>
          </tr>
          <tr>
            <td>steps</td>
            <td>The steps involved in reaching the achievement
            </td>
          </tr>
        </table>
        <h4>Usage Limits</h4>
        <p>Please be considerate in your use of the ETHRank API.
          Do not exceed 1 request per 5 seconds, or 10 requests per minute.
          Attempts to go beyond these limits are restricted.</p>

        <h4>Copyright Notice</h4>
        <p>Use of this API must be accompanied by a link back to ETHRank.io, or the text &quot;Powered by ETHRank&quot; must be clearly visible on any websites, dapps, projects, businesses, reports, or any other work product that uses this API.</p>


        <h4>Disclaimer</h4>
        <p>This API is provided free of charge, and is subject to change and/or cancellation at any time.
          ETHRank API is distributed in the hope that it will
          be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
          of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU General Public License for more details.</p>
      </div>
    </div>
  </Page>
}

export default APIDocs