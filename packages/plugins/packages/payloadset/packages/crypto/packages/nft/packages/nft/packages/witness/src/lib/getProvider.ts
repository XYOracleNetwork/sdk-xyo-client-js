import { InfuraProvider, WebSocketProvider } from '@ethersproject/providers'

export const getProviderFromEnv = (chainId: string | number = 'homestead') => {
  const infuraWssUri = process.env.INFURA_WSS_URI
  const infuraProvider = new InfuraProvider('homestead', {
    projectId: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  })

  const infuraWebsocketProvider = infuraWssUri ? new WebSocketProvider(infuraWssUri, chainId) : undefined

  const quickNodeUri = process.env.QUICKNODE_WSS_URI
  const quickNodeProvider = quickNodeUri ? new WebSocketProvider(quickNodeUri, chainId) : undefined

  const provider = infuraProvider ?? infuraWebsocketProvider ?? quickNodeProvider ?? infuraProvider
  return provider
}
