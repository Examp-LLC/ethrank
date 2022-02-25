
import dynamic from 'next/dynamic'

const ConnectButtonInner = dynamic(
  () => import('../components/ConnectButtonInner'),
  { ssr: false }
)

const ConnectButtonOuter = () => {
  return <ConnectButtonInner />
};

export default ConnectButtonOuter;