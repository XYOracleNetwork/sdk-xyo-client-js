import { axios } from '@xyo-network/axios'
import { EthereumGasEthgasstationResponse } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'

const url = 'https://api.ethgasstation.info/api/fee-estimate'

export const getGasFromEthgasstation = async (): Promise<EthereumGasEthgasstationResponse> => {
  return (await axios.get<EthereumGasEthgasstationResponse>(url)).data
}
