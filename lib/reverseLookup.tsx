
// @ts-ignore
import namehash from '@ensdomains/eth-ens-namehash';
import Resolution, { UnsLocation } from '@unstoppabledomains/resolution';
import Web3 from 'web3';

const NEXT_PUBLIC_UNSTOPPABLE_SDK_KEY = process.env.NEXT_PUBLIC_UNSTOPPABLE_SDK_KEY;
export async function reverseLookup(address: string, web3: Web3) {

  try {
    let lookup = address.toLowerCase().substr(2) + '.addr.reverse'
    let ResolverContract = await web3.eth.ens.getResolver(lookup);
    let nh = namehash.hash(lookup);
    let name = await ResolverContract.methods.name(nh).call();
    if (name && name.length) {
      const verifiedAddress = await web3.eth.ens.getAddress(name);
      if (verifiedAddress && verifiedAddress.toLowerCase() === address.toLowerCase()) {
        return name;
      }
    }
  } catch (e) { }
  
  try {
    // @ts-ignore
    const resolution = new Resolution({ apiKey: NEXT_PUBLIC_UNSTOPPABLE_SDK_KEY });
    const domain = await resolution
      .reverse(address, {location: UnsLocation.Layer2})
      .then((domain) => domain);
    if (domain) return domain;
  } catch (e) { }
}