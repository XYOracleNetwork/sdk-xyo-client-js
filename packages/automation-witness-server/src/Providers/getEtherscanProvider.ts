import { EtherscanProvider, Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'

let instance: EtherscanProvider | undefined = undefined

export const getEtherscanProvider = (): Provider => {
  if (instance) return instance
  const apiKey = getEtherscanProviderConfig()
  instance = new EtherscanProvider('homestead', apiKey)
  return instance
}

export const canUseEtherscanProvider = (): boolean => {
  return process.env.ETHERSCAN_API_KEY ? true : false
}

export const getEtherscanProviderConfig = (): string => {
  const projectKey = assertEx(process.env.ETHERSCAN_API_KEY)
  return projectKey
}
