import { BaseProvider, InfuraProvider, InfuraWebSocketProvider, JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'

export type ProviderSource = 'infura' | 'quicknode'
export type ProviderType = 'rpc' | 'wss'

const createInfuraRpc = (chainId: number) => {
  return new InfuraProvider(chainId, {
    projectId: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  })
}

const createInfuraWss = (chainId: number) => {
  return new InfuraWebSocketProvider(chainId, {
    projectId: process.env.INFURA_PROJECT_ID,
  })
}

const createQuicknodeWss = (chainId: number) => {
  const quickNodeWSSUri = process.env.QUICKNODE_WSS_URI
  return quickNodeWSSUri ? new WebSocketProvider(quickNodeWSSUri, chainId) : undefined
}

const createQuicknodeRpc = (chainId: number) => {
  const quickNodeHttpsUri = process.env.QUICKNODE_HTTPS_URI
  return quickNodeHttpsUri ? new JsonRpcProvider(quickNodeHttpsUri, chainId) : undefined
}

export const getProviderFromEnv = (
  chainId: number = 0x01,
  options?: { providerSource?: ProviderSource; providerType?: ProviderType },
): BaseProvider => {
  const { providerSource, providerType } = options ?? {}
  let provider: BaseProvider | undefined = undefined
  switch (providerSource) {
    case 'quicknode': {
      switch (providerType) {
        case 'rpc': {
          provider = createQuicknodeRpc(chainId)
          break
        }
        case 'wss':
        default: {
          provider = createQuicknodeWss(chainId)
          break
        }
      }
      break
    }
    default:
    case 'infura': {
      switch (providerType) {
        case 'rpc': {
          provider = createInfuraRpc(chainId)
          break
        }
        case 'wss':
        default: {
          provider = createInfuraWss(chainId)
          break
        }
      }
      break
    }
  }
  if (!provider) {
    provider = createInfuraWss(chainId) ?? createInfuraRpc(chainId) ?? createQuicknodeRpc(chainId)
  }
  return assertEx(provider, `Unable to create provider [${chainId}]: ${options ? JSON.stringify(options) : 'default'}`)
}

const providers: Record<string, BaseProvider> = {}

export const getSharedProviderFromEnv = (
  chainId: number = 0x01,
  options?: { providerSource?: ProviderSource; providerType?: ProviderType },
): BaseProvider => {
  const key = `${chainId}:${options ? JSON.stringify(options) : 'default'}`
  providers[key] = providers[key] ?? getProviderFromEnv(chainId, options)
  return providers[key]
}
