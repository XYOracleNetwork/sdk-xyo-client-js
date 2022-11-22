import axios from 'axios'

import { EthereumGasEthersResponse } from '../Payload'

export const getGasFromEthers = async (apiKey: string): Promise<EthereumGasEthersResponse> => {
  const url = `https://api.ethers.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`
  return (await axios.get<EthereumGasEthersResponse>(url)).data
}
