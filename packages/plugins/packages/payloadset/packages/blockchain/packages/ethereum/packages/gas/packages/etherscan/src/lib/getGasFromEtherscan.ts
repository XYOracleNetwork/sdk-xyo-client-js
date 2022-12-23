import { axios } from '@xyo-network/axios'
import { EthereumGasEtherscanResponse } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

export const getGasFromEtherscan = async (apiKey: string): Promise<EthereumGasEtherscanResponse> => {
  const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`
  return (await axios.get<EthereumGasEtherscanResponse>(url)).data
}
