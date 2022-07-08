import axios from 'axios'

export interface EtherchainGasPriceResult {
  safeLow: number
  standard: number
  fast: number
  fastest: number
  currentBaseFee: number
  recommendedBaseFee: number
}

export const getGasFromEtherchain = async (): Promise<EtherchainGasPriceResult> => {
  const etherchainGasPrices = (await axios.get<EtherchainGasPriceResult>('https://www.etherchain.org/api/gasPriceOracle')).data
  return etherchainGasPrices
}
