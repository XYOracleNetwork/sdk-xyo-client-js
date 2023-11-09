import { InfuraProvider, JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'

export const getProviderFromEnvInternal = (chainId: number = 0x01) => {
  console.log(`getProviderFromEnvInternal: ${chainId}`)
  const infuraWssUri = process.env.INFURA_WSS_URI
  const infuraProvider = new InfuraProvider(chainId, {
    projectId: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  })

  const infuraGenericWebsocketProvider = infuraWssUri ? new WebSocketProvider(infuraWssUri, chainId) : undefined

  const quickNodeWSSUri = process.env.QUICKNODE_WSS_URI
  const quickNodeWebSocketProvider = quickNodeWSSUri ? new WebSocketProvider(quickNodeWSSUri, chainId) : undefined

  const quickNodeHttpsUri = process.env.QUICKNODE_WSS_URI
  const quickRpcProvider = quickNodeHttpsUri ? new JsonRpcProvider(quickNodeHttpsUri, chainId) : undefined

  const provider = infuraProvider ?? quickNodeWebSocketProvider ?? infuraProvider ?? infuraGenericWebsocketProvider ?? quickRpcProvider
  return provider
}

const providers: Record<number, JsonRpcProvider | WebSocketProvider> = {}

export const getProviderFromEnv = (chainId: number = 0x01) => {
  console.log(`getProviderFromEnv: ${chainId}`)
  providers[chainId] = providers[chainId] ?? getProviderFromEnvInternal(chainId)
  return providers[chainId]
}
