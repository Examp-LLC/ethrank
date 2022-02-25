import Router, { useRouter } from 'next/router'
import Web3 from 'web3';
import { useEffect } from 'react';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Page from '../../components/Page';

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

    const res = await fetch(`https://unstoppabledomains.com/api/v1/${unstoppableName}`);
    const resJson = await res.json();

    if (resJson && resJson.meta && resJson.meta.owner) {
      address = resJson.meta.owner;
    } else {
      error = true;
    }
  }
  return { address, error };
}
