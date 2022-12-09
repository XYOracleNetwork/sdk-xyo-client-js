import { EthereumGasEtherchainV2Response } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import axios from 'axios'

const url = 'https://www.etherchain.org/api/gasnow'

export const getV2GasFromEtherchain = async (): Promise<EthereumGasEtherchainV2Response> => {
  return (await axios.get<EthereumGasEtherchainV2Response>(url)).data
}
