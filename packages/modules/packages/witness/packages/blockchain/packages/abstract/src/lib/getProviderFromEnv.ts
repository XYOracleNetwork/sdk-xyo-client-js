import { BaseProvider, InfuraProvider, InfuraWebSocketProvider, JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { ConnectionInfo } from '@ethersproject/web'
import { assertEx } from '@xylabs/assert'

export type ProviderSource = 'infura' | 'quicknode'
export type ProviderType = 'rpc' | 'wss'

export interface GetProvidersFromEnvOptions {
  overrides?: Partial<ConnectionInfo>
  providerSource?: ProviderSource
  providerType?: ProviderType
}

const enableConfigOverride = false

const configureConnection = (connection?: ConnectionInfo, { timeout = 1000 }: Partial<ConnectionInfo> = {}) => {
  if (connection && enableConfigOverride) {
    connection.timeout = timeout
    connection.throttleCallback = async (attempt, url) => {
      console.log(`throttleCallback[${attempt}]: ${url}`)
      return await Promise.resolve(true)
    }
  }
}

const createInfuraRpc = (chainId: number, overrides?: Partial<ConnectionInfo>) => {
  const provider =
    process.env.INFURA_PROJECT_ID && process.env.INFURA_PROJECT_SECRET
      ? new InfuraProvider(chainId, {
          projectId: process.env.INFURA_PROJECT_ID,
          projectSecret: process.env.INFURA_PROJECT_SECRET,
        })
      : undefined
  configureConnection(provider?.connection, overrides)
  return provider
}

const createInfuraWss = (chainId: number, overrides?: Partial<ConnectionInfo>) => {
  const provider = process.env.INFURA_PROJECT_ID
    ? new InfuraWebSocketProvider(chainId, {
        projectId: process.env.INFURA_PROJECT_ID,
      })
    : undefined
  configureConnection(provider?.connection, overrides)
  return provider
}

const createQuicknodeWss = (chainId: number, overrides?: Partial<ConnectionInfo>) => {
  const quickNodeWSSUri = process.env.QUICKNODE_WSS_URI
  const provider = quickNodeWSSUri ? new WebSocketProvider(quickNodeWSSUri, chainId) : undefined
  configureConnection(provider?.connection, overrides)
  return provider
}

const createQuicknodeRpc = (chainId: number, overrides?: Partial<ConnectionInfo>) => {
  const quickNodeHttpsUri = process.env.QUICKNODE_HTTPS_URI
  const provider = quickNodeHttpsUri ? new JsonRpcProvider(quickNodeHttpsUri, chainId) : undefined
  configureConnection(provider?.connection, overrides)
  return provider
}

export const getProviderFromEnv = (
  chainId: number = 0x01,
  { providerSource = 'infura', providerType = 'rpc', overrides }: GetProvidersFromEnvOptions = {},
): BaseProvider => {
  let provider: BaseProvider | undefined = undefined
  switch (providerSource) {
    case 'quicknode': {
      switch (providerType) {
        case 'rpc': {
          provider = createQuicknodeRpc(chainId, overrides)
          break
        }
        case 'wss': {
          provider = createQuicknodeWss(chainId, overrides)
          break
        }
      }
      break
    }
    default:
    case 'infura': {
      switch (providerType) {
        case 'wss': {
          provider = createInfuraWss(chainId, overrides)
          break
        }
        case 'rpc': {
          provider = createInfuraRpc(chainId, overrides)
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

const providers: Record<string, BaseProvider> = {}

export const getSharedProviderFromEnv = (
  chainId: number = 0x01,
  options?: { providerSource?: ProviderSource; providerType?: ProviderType },
): BaseProvider => {
  const key = `${chainId}:${options ? JSON.stringify(options) : 'default'}`
  providers[key] = providers[key] ?? getProviderFromEnv(chainId, options)
  return providers[key]
}

export const getProvidersFromEnv = (count: number, chainId: number = 0x01, options: GetProvidersFromEnvOptions = {}): BaseProvider[] => {
  const result: BaseProvider[] = []
  for (let i = 0; i < count; i++) {
    result.push(getProviderFromEnv(chainId, options))
  }
  return result
}
