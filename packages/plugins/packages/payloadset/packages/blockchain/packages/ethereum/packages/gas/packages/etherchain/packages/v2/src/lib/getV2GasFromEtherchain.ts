import { axios } from '@xyo-network/axios'
import { EthereumGasEtherchainV2Response } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'

const url = 'https://beaconcha.in/api/v1/execution/gasnow'

export const getV2GasFromEtherchain = async (): Promise<EthereumGasEtherchainV2Response> => {
  return (await axios.get<EthereumGasEtherchainV2Response>(url)).data
}
