import axios from 'axios'

import { EthereumGasEtherchainV1Response } from '../Payload'

export const getV1GasFromEtherchain = async (): Promise<EthereumGasEtherchainV1Response> => {
  const etherchainGasPrices = (await axios.get<EthereumGasEtherchainV1Response>('https://www.etherchain.org/api/gasPriceOracle')).data
  return etherchainGasPrices
}
