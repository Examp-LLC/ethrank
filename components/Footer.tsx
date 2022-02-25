import Link from 'next/link';
import React, { useState }  from 'react';
import styles from '../styles/Footer.module.scss';
// import ConnectButton from './ConnectButton';

function Footer() {

  const [emailAddr, setEmailAddr] = useState("")

  return (
  <div className={styles.footer}>
    <div className={styles.topRow}>
    <div className={styles.form}>

    <h3>Stay in the loop</h3>

<div id="mc_embed_signup">
<form action="https://examp.us18.list-manage.com/subscribe/post?u=4118b39975b9020761dfe59c4&amp;id=d2544fe972" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
    <div id="mc_embed_signup_scroll">
<div className="mc-field-group">
	<p><label htmlFor="mce-EMAIL">Sign up for our newsletter to always get the latest updates</label></p>
	<input type="email" onChange={(e) => {
    setEmailAddr(e.target.value);   
  }} value={emailAddr} name="EMAIL" className="required email" id="mce-EMAIL" />
  <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" className={styles.btn} />
</div>
	<div id="mce-responses" className="clear foot">
		<div className="response" id="mce-error-response" style={{display:"none"}}></div>
		<div className="response" id="mce-success-response" style={{display:"none"}}></div>
	</div>   
    <div style={{position: "absolute", left: "-5000px"}} aria-hidden="true"><input type="text" name="b_4118b39975b9020761dfe59c4_d2544fe972" tabIndex={-1} defaultValue="" /></div>
    </div>
</form>
</div>

    </div>
    <div className={styles.social}>
      <h3>Join the community</h3>
      <ul>
        <li className={styles.twitter}><a href="https://twitter.com/eth_rank"target="_blank" rel="noreferrer"><span>Twitter</span></a></li>
        <li className={styles.discord}><a href="https://discord.gg/ap2ye7Qqgy"target="_blank" rel="noreferrer"><span>Discord</span></a></li>
        {/* <li><a href="">GitHub</a></li> */}
        <li className={styles.telegram}><a href="https://t.me/ExampLLC"target="_blank" rel="noreferrer"><span>Telegram</span></a></li>
      </ul>
    </div>

    </div>

    <div className={styles.secondRow}>
    <div className={styles.about}>
      <h1>ETHRank</h1>
      <p>A blockchain adventure.</p><br />
      {/* <ConnectButton /> */}
    </div>
    <div className={styles.links}>
      <ul>
        <li><Link href="/"><a>Home</a></Link></li>
        <li><Link href="/leaderboard"><a>Leaderboard</a></Link></li>
        <li><Link href="/faqs"><a>FAQs</a></Link></li>
        <li><Link href="/api-docs"><a>API</a></Link></li>
        <li><Link href="/privacy"><a>Privacy</a></Link></li>
        <li><Link href="/terms"><a>Terms of Use</a></Link></li>
      </ul>
    </div>
    </div>
{/* 
    <h2>Total Transactions: </h2>{totalTransactions}
    <h2>Points possible: </h2>{totalPointsPossible} */}

    <p className={styles.copyright}>All content copyright 2022 Examp, LLC</p>
  </div>
)
  }
export default Footer;