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
    const web3 = new Web3('wss://mainnet.infura.io/ws/v3/aa29126d46224562ad769bca03dcf066');

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