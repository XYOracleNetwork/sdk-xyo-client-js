import { assertEx } from '@xylabs/assert'
import { InfuraProvider, InfuraWebSocketProvider, JsonRpcProvider, Provider, WebSocketProvider } from 'ethers'

export type ProviderSource = 'infura' | 'quicknode'
export type ProviderType = 'rpc' | 'wss'

export interface GetProvidersFromEnvOptions {
  providerSource?: ProviderSource
  providerType?: ProviderType
}

const createInfuraRpc = (chainId: number) => {
  const provider =
    process.env.INFURA_PROJECT_ID && process.env.INFURA_PROJECT_SECRET ? new InfuraProvider(chainId, process.env.INFURA_PROJECT_ID) : undefined
  return provider
}

const createInfuraWss = (chainId: number) => {
  const provider = process.env.INFURA_PROJECT_ID ? new InfuraWebSocketProvider(chainId, process.env.INFURA_PROJECT_ID) : undefined
  return provider
}

const createQuicknodeWss = (chainId: number) => {
  const quickNodeWSSUri = process.env.QUICKNODE_WSS_URI
  const provider = quickNodeWSSUri ? new WebSocketProvider(quickNodeWSSUri, chainId) : undefined

  return provider
}

const createQuicknodeRpc = (chainId: number) => {
  const quickNodeHttpsUri = process.env.QUICKNODE_HTTPS_URI
  const provider = quickNodeHttpsUri ? new JsonRpcProvider(quickNodeHttpsUri, chainId) : undefined
  return provider
}

export const getProviderFromEnv = (
  chainId: number = 0x01,
  { providerSource = 'infura', providerType = 'rpc' }: GetProvidersFromEnvOptions = {},
): Provider => {
  let provider: Provider | undefined = undefined
  switch (providerSource) {
    case 'quicknode': {
      switch (providerType) {
        case 'rpc': {
          provider = createQuicknodeRpc(chainId)
          break
        }
        case 'wss': {
          provider = createQuicknodeWss(chainId)
          break
        }
      }
      break
    }
    default:
    case 'infura': {
      switch (providerType) {
        case 'wss': {
          provider = createInfuraWss(chainId)
          break
        }
        case 'rpc': {
          provider = createInfuraRpc(chainId)
          break
        }
      }
      break
    }
  }
  if (!provider) {
    provider = createInfuraWss(chainId) ?? createInfuraRpc(chainId) ?? createQuicknodeRpc(chainId)
  }
  return assertEx(provider, `Unable to create provider [${chainId}]: ${providerSource}|${providerType}`)
}

const providers: Record<string, Provider> = {}

export const getSharedProviderFromEnv = (
  chainId: number = 0x01,
  options?: { providerSource?: ProviderSource; providerType?: ProviderType },
): Provider => {
  const key = `${chainId}:${options ? JSON.stringify(options) : 'default'}`
  providers[key] = providers[key] ?? getProviderFromEnv(chainId, options)
  return providers[key]
}

export const getProvidersFromEnv = (count: number = 1, chainId: number = 0x01, options: GetProvidersFromEnvOptions = {}): Provider[] => {
  const result: Provider[] = []
  for (let i = 0; i < count; i++) {
    result.push(getProviderFromEnv(chainId, options))
  }
  return result
}
