import { AlchemyProvider, Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'

let instance: AlchemyProvider | undefined = undefined

export const getAlchemyProvider = (): Provider => {
  if (instance) return instance
  const apiKey = getAlchemyProviderConfig()
  instance = new AlchemyProvider('homestead', apiKey)
  return instance
}

export const canUseAlchemyProvider = (): boolean => {
  return process.env.ALCHEMY_PROJECT_KEY ? true : false
}

export const getAlchemyProviderConfig = (): string => {
  const projectKey = assertEx(process.env.ALCHEMY_PROJECT_KEY)
  return projectKey
}
