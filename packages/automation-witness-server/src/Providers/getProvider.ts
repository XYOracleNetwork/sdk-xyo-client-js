import { getDefaultProvider, Provider } from '@ethersproject/providers'

import { ProviderOptions } from '../Model'
import { canUseAlchemyProvider, getAlchemyProviderConfig } from './getAlchemyProvider'
import { canUseEtherscanProvider, getEtherscanProviderConfig } from './getEtherscanProvider'
import { canUseInfuraProvider, getInfuraProviderConfig } from './getInfuraProvider'
import { canUsePocketProvider, getPocketProviderConfig } from './getPocketProvider'
import { providerOmitted } from './ProviderOmitted'

let instance: Provider | undefined = undefined

export const getProvider = (): Provider => {
  if (instance) return instance
  instance = getDefaultProvider('homestead', getProviderOptions())
  return instance
}

const getProviderOptions = (): ProviderOptions => {
  const alchemy = canUseAlchemyProvider() ? getAlchemyProviderConfig() : providerOmitted
  const etherscan = canUseEtherscanProvider() ? getEtherscanProviderConfig() : providerOmitted
  const infura = canUseInfuraProvider() ? getInfuraProviderConfig() : providerOmitted
  const pocket = canUsePocketProvider() ? getPocketProviderConfig() : providerOmitted
  return { alchemy, etherscan, infura, pocket }
}
