import { EthereumGasEthgasstationResponse } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import axios from 'axios'

const url = 'https://api.ethgasstation.info/api/fee-estimate'

export const getGasFromEthgasstation = async (): Promise<EthereumGasEthgasstationResponse> => {
  return (await axios.get<EthereumGasEthgasstationResponse>(url)).data
}
