import axios from 'axios'

import { EthereumGasEtherchainV1Response } from '../Payload'

const url = 'https://www.etherchain.org/api/gasPriceOracle'

export const getV1GasFromEtherchain = async (): Promise<EthereumGasEtherchainV1Response> => {
  return (await axios.get<EthereumGasEtherchainV1Response>(url)).data
}
