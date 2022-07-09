import axios from 'axios'

import { EtherscanGasPriceResult } from './EtherscanGasPriceResult'

const apiKey = process.env.ETHERSCAN_API_KEY

export const getGasFromEtherscan = async (): Promise<EtherscanGasPriceResult> => {
  const gasPrices = (await axios.get<EtherscanGasPriceResult>(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`)).data
  return gasPrices
}
