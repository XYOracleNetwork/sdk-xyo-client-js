import axios from 'axios'

import { EthereumGasEthgasstationV1Response } from '../Payload'

const url = 'https://www.ethgasstation.org/api/gasPriceOracle'

export const getV1GasFromEthgasstation = async (): Promise<EthereumGasEthgasstationV1Response> => {
  return (await axios.get<EthereumGasEthgasstationV1Response>(url)).data
}
