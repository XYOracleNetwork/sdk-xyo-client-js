import { EthereumGasEtherchainV1Response } from '@xyo-network/etherchain-ethereum-gas-v1-payload-plugin'
import axios from 'axios'

const url = 'https://www.etherchain.org/api/gasPriceOracle'

export const getV1GasFromEtherchain = async (): Promise<EthereumGasEtherchainV1Response> => {
  return (await axios.get<EthereumGasEtherchainV1Response>(url)).data
}
