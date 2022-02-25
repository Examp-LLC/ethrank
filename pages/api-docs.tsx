import Page from '../components/Page';

const APIDocs = ({  }) => {
  return <Page title="ETHRank - API Documentation">
    <div className="content">
      <div>
        <h3>ETHRank API Documentation</h3>
        <h4>Get ETHRank and Score for a Single Address</h4>
        <p>Returns the ETHRank and score of a given address in JSON format.</p>
        <pre>
            https://ethrank.io/api/address/0XE4A7D5AD789DBED5F568BD37915952727572D82F
        </pre>
        <p>Try this endpoint in your <a href="https://ethrank.io/api/address/0XE4A7D5AD789DBED5F568BD37915952727572D82F">browser 🔗</a>.</p>
        <h5>Sample Response</h5>
        <pre>
            {`{"score":300,"rank":25}`}
        </pre>
      </div>
    </div>
  </Page>
}

export default APIDocs