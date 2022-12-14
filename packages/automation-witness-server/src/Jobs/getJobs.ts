import { Job } from '@xyo-network/shared'

import { getJob as getCryptoMarketWitnessJob } from './CryptoMarket'
import { getJob as getEthereumGasJob } from './EthereumGas'

export const getJobs = (): Job[] => {
  return [getCryptoMarketWitnessJob(), getEthereumGasJob()]
}
