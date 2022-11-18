import axios from 'axios'

import { EthereumGasEtherscanResponse } from '../Payload'

export const getGasFromEtherscan = async (apiKey: string): Promise<EthereumGasEtherscanResponse> => {
  const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`
  return (await axios.get<EthereumGasEtherscanResponse>(url)).data
}
