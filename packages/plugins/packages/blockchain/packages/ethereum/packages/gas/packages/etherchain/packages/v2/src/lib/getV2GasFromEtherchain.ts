import axios from 'axios'

import { EthereumGasEtherchainV2Response } from '../Payload'

export const getV2GasFromEtherchain = async (): Promise<EthereumGasEtherchainV2Response> => {
  const etherchainGasPrices = (await axios.get<EthereumGasEtherchainV2Response>('https://www.etherchain.org/api/gasnow')).data
  return etherchainGasPrices
}
