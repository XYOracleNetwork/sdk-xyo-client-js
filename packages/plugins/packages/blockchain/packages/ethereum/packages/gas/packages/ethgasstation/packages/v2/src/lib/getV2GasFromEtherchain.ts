import axios from 'axios'

import { EthereumGasEthgasstationV2Response } from '../Payload'

const url = 'https://www.ethgasstation.org/api/gasnow'

export const getV2GasFromEthgasstation = async (): Promise<EthereumGasEthgasstationV2Response> => {
  return (await axios.get<EthereumGasEthgasstationV2Response>(url)).data
}
