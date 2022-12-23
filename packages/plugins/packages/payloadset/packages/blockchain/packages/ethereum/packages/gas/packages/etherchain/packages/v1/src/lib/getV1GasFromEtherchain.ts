import { axios } from '@xyo-network/axios'
import { EthereumGasEtherchainV1Response } from '@xyo-network/etherchain-ethereum-gas-v1-payload-plugin'

const url = 'https://www.etherchain.org/api/gasPriceOracle'

export const getV1GasFromEtherchain = async (): Promise<EthereumGasEtherchainV1Response> => {
  return (await axios.get<EthereumGasEtherchainV1Response>(url)).data
}
