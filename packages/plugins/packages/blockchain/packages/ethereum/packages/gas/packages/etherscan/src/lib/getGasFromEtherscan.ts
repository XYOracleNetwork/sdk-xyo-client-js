import axios from 'axios'

import { EthereumGasEtherscanResponse } from '../Payload'

export const getGasFromEtherscan = async (apiKey: string): Promise<EthereumGasEtherscanResponse> => {
  const gasPrices = (
    await axios.get<EthereumGasEtherscanResponse>(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`)
  ).data
  return gasPrices
}
