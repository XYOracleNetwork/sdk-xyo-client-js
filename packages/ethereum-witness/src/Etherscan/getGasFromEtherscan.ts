import axios from 'axios'

import { EtherscanGasPriceResult } from './EtherscanGasPriceResult'

export const getGasFromEtherscan = async (apiKey: string): Promise<EtherscanGasPriceResult> => {
  const gasPrices = (await axios.get<EtherscanGasPriceResult>(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`)).data
  return gasPrices
}
