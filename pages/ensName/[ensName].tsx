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

import { useRouter } from 'next/router'
import Web3 from 'web3';
import { useEffect } from 'react';
import { NextPageContext } from 'next';
import Page from '../../components/Page';

export async function getServerSideProps(context: NextPageContext) {
  const { ensName } = context.query;
  let error = false;
  let address = '';

  // /address/nick.eth
  if (ensName && typeof ensName === "string" && ensName.toLowerCase().indexOf('.eth') > -1) {

    //resolve 0x21ada3.. to nick.eth
    const web3 = new Web3(`wss://mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`);

    try {
      address = await web3.eth.ens.getAddress(ensName);
    } catch (e) {
    }

    if (!address) {
      error = true;
    }
  }

  return {
    props: {
      address,
      error,
    }
  }
}

export interface ENSNameProps {
  address: string,
  error: boolean | string
}

const ENSName = ({ address, error }: ENSNameProps) => {

  const router = useRouter()

  useEffect(() => {
    if (error || !address.length) {
      router.push('/error');
    } else {
      router.push(`/address/${address}`);
    }
  });

  return <Page title="ETHRank">
    <div className="content">
      <h2 className="gradient-box gradient-bottom-only">Redirecting, please wait...</h2>
    </div>
    </Page>
}

export default ENSName