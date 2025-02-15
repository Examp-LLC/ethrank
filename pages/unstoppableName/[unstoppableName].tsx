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


import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { NextPageContext } from 'next';
import Page from '../../components/Page';

const UNSTOPPABLE_API_KEY = process.env.UNSTOPPABLE_API_KEY;

export async function getServerSideProps(context: NextPageContext) {
  const { unstoppableName } = context.query;

  if (typeof unstoppableName !== 'string') return;

  const { address, error } = await lookupUnstoppableName(unstoppableName);

  return {
    props: {
      address,
      unstoppableName,
      error,
    }
  }
}

export interface UnstoppableProps {
  address: string,
  unstoppableName: string,
  error: boolean | string
}

const UnstoppableRedirect = ({ address, unstoppableName, error }: UnstoppableProps) => {

  const router = useRouter()

  useEffect(() => {
    if (error || !address.length) {
      router.push('/error');
    } else {
      router.push(`/address/${address}?ud=${unstoppableName}`);
    }
  });

  return <Page title="ETHRank">
    <div className="content">
      <h2 className="gradient-box gradient-bottom-only">Redirecting, please wait...</h2>
    </div>
  </Page>
}

export default UnstoppableRedirect

export async function lookupUnstoppableName(unstoppableName: string) {
  let address = '';
  let error = false;

  if (unstoppableName && typeof unstoppableName === "string") {

    const res = await fetch(`https://api.unstoppabledomains.com/resolve/domains/${unstoppableName}`, {
      headers: {
        'Authorization': `Bearer ${UNSTOPPABLE_API_KEY}`
      }
    });
    const resJson = await res.json();

    if (resJson && resJson.meta && resJson.meta.owner) {
      address = resJson.meta.owner;
    } else {
      error = true;
    }
  }
  return { address, error };
}
