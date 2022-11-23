import axios from 'axios'

import { EthereumGasEthgasstationResponse } from '../Payload'

const url = 'https://api.ethgasstation.info/api/fee-estimate'

export const getGasFromEthgasstation = async (): Promise<EthereumGasEthgasstationResponse> => {
  return (await axios.get<EthereumGasEthgasstationResponse>(url)).data
}
