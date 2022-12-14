import { InfuraProvider, Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'

import { InfuraProviderConfig } from '../Model'

let instance: InfuraProvider | undefined = undefined

export const getInfuraProvider = (): Provider => {
  if (instance) return instance
  const config = getInfuraProviderConfig()
  instance = new InfuraProvider('homestead', config)
  return instance
}

export const canUseInfuraProvider = (): boolean => {
  return !!process.env.INFURA_PROJECT_ID && !!process.env.INFURA_PROJECT_SECRET ? true : false
}

export const getInfuraProviderConfig = (): InfuraProviderConfig => {
  const projectId = assertEx(process.env.INFURA_PROJECT_ID)
  const projectSecret = assertEx(process.env.INFURA_PROJECT_SECRET)
  return { projectId, projectSecret }
}
