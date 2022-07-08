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

const APIDocs = ({  }) => {
  return <Page title="ETHRank - API Documentation">
    <div className="content">
      <div>
        <h3>ETHRank API Documentation</h3>
        <h4>Get ETHRank and Score for a Single Address</h4>
        <p>Returns the ETHRank and score of a given address in JSON format.</p>
        <pre>
            https://ethrank.io/api/address/0xfe6b2924685dc14cd3ea4688539de5307c40312a
        </pre>
        <p>Try this endpoint in your <a href="https://ethrank.io/api/address/0xfe6b2924685dc14cd3ea4688539de5307c40312a">browser 🔗</a>.</p>
        <h5>Sample Response</h5>
        <pre>
            {`{"score":610,"rank":1151,"progress":["040","111","146","240","041","042","04","001"]}`}
        </pre>
      </div>
    </div>
  </Page>
}

export default APIDocs