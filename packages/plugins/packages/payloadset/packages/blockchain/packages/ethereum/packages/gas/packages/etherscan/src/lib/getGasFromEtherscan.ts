import { EthereumGasEtherscanResponse } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import axios from 'axios'

export const getGasFromEtherscan = async (apiKey: string): Promise<EthereumGasEtherscanResponse> => {
  const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`
  return (await axios.get<EthereumGasEtherscanResponse>(url)).data
}
