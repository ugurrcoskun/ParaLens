import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { monadTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

export const config = projectId
  ? getDefaultConfig({
      appName: 'ParaLens',
      projectId,
      chains: [monadTestnet],
      transports: {
        [monadTestnet.id]: http(process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz'),
      },
      ssr: true,
    })
  : createConfig({
      chains: [monadTestnet],
      connectors: [injected()],
      transports: {
        [monadTestnet.id]: http(process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz'),
      },
      ssr: true,
    })
