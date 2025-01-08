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
import Link from 'next/link';
import React, { useState } from 'react';
import styles from '../styles/Footer.module.scss';
import btnStyles from '../styles/ConnectButton.module.scss';
import Script from 'next/script';

function Footer() {

  const [emailAddr, setEmailAddr] = useState("")

  return (
    <div className={styles.footer}>
      <div className={styles.topRow}>
        <div className={styles.form}>

          <h2>Stay in the loop</h2>

          <div id="mc_embed_signup">
            <form action="https://examp.us18.list-manage.com/subscribe/post?u=4118b39975b9020761dfe59c4&amp;id=d2544fe972" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
              <div id="mc_embed_signup_scroll">
                <div className="mc-field-group">
                  <p><label htmlFor="mce-EMAIL">Sign up for our newsletter to always get the latest updates</label></p>
                  <input type="email" onChange={(e) => {
                    setEmailAddr(e.target.value);
                  }} value={emailAddr} name="EMAIL" className="required email" id="mce-EMAIL" />
                  <span className={btnStyles.btn}><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" /></span>
                </div>
                <div id="mce-responses" className="clear foot">
                  <div className="response" id="mce-error-response" style={{ display: "none" }}></div>
                  <div className="response" id="mce-success-response" style={{ display: "none" }}></div>
                </div>
                <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true"><input type="text" name="b_4118b39975b9020761dfe59c4_d2544fe972" tabIndex={-1} defaultValue="" /></div>
              </div>
            </form>
            <img src="/bg-coin-subscribe.png" className={styles.coin} width="398" height="407" alt="Coin" />
          </div>

        </div>
        <div className={styles.social}>
          <h3>Join the community</h3>
          <ul>
            <li className={styles.twitter}><a href="https://twitter.com/eth_rank" target="_blank" rel="noreferrer"><span>Twitter</span></a></li>
            <li className={styles.discord}><a href="https://discord.gg/CNVQWw6KFU" target="_blank" rel="noreferrer"><span>Discord</span></a></li>
            <li className={styles.github}><a href="https://github.com/Examp-LLC/ethrank" target="_blank" rel="noreferrer"><span>GitHub</span></a></li>
            <li className={styles.telegram}><a href="https://t.me/ExampLLC" target="_blank" rel="noreferrer"><span>Telegram</span></a></li>
            <li className={styles.bluesky}><a href="https://ethrank.bsky.social" target="_blank" rel="noreferrer"><span>Bluesky</span></a></li>
            <li className={styles.facebook}><a href="https://www.facebook.com/profile.php?id=61571619963842" target="_blank" rel="noreferrer"><span>Facebook</span></a></li>
            <li className={styles.instagram}><a href="https://www.instagram.com/ethrank.io/" target="_blank" rel="noreferrer"><span>Instagram</span></a></li>
          </ul>
        </div>
        <div className={`${styles.dot} ${styles.topRight}`} />
        <div className={`${styles.dot} ${styles.bottomLeft}`} />
        <div className={`${styles.dot} ${styles.bottomRight}`} />
        <div className={styles.dot} />
      </div>

      <div className={styles.secondRow}>
        <div className={styles.about}>
          <h1>ETHRank</h1>
          <p>The Ethereum Leaderboard.</p>
          <a href="https://alchemy.com/?r=zk3OTkzMTkwMjU5M">
            <img style={{ width: 240, height: 40 }} src="https://static.alchemyapi.io/images/marketing/alchemy-wagbi-badge-dark.png" alt="Alchemy Supercharged" />
          </a>
          <p className={styles.copyright}>Created by <a href="http://examp.com/" target="_blank" rel="noreferrer">Examp, LLC</a></p>
        </div>
        <div className={styles.links}>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/leaderboard">Leaderboard</Link></li>
            <li><Link href="/faqs">FAQs</Link></li>
            <li><Link href="/api-docs">API</Link></li>
          </ul>
        </div>
        <div className={styles.links}>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms of Use</Link></li>
            <li><a href="https://docs.google.com/forms/d/1NWrtRONleo-MoEJpLamxtRQrzpxPpam89Gwn6NzE98Y" target="_blank" rel="noreferrer">Partner Request</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
export default Footer;