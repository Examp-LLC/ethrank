
import dynamic from 'next/dynamic'
import { PropsWithChildren, ReactNode } from 'react';

const ConnectButton = dynamic(
  () => import('./ConnectButton'),
  { ssr: false }
)

const ConnectButtonProvider = (props: PropsWithChildren<ReactNode>) => {
  return <ConnectButton>
    {props.children}
  </ConnectButton>
};

export default ConnectButtonProvider;