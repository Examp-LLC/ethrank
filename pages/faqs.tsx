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
                <h4>When does Season 1 end and/or when does Season 2 begin?</h4>
                <p>This is still being determined. Please stay tuned and join the community if you have any suggestions. We welcome your feedback!</p>
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