import { Provider } from '@ethersproject/providers'

import { logErrors } from '../logErrors'
import { EthersUniSwap3Pair } from './UniSwap3Pair'

export const createUniswapPoolContracts = (provider: Provider, contracts: string[]) => {
  return logErrors(() => {
    return contracts.map((contract) => new EthersUniSwap3Pair(contract, provider))
  })
}
