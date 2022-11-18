import axios from 'axios'

import { EthereumGasEtherchainV2Response } from '../Payload'

const url = 'https://www.etherchain.org/api/gasnow'

export const getV2GasFromEtherchain = async (): Promise<EthereumGasEtherchainV2Response> => {
  return (await axios.get<EthereumGasEtherchainV2Response>(url)).data
}
