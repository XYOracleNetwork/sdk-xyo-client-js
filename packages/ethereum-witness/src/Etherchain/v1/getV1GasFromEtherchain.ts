import axios from 'axios'

export interface EtherchainGasPriceResultV1 {
  safeLow: number
  standard: number
  fast: number
  fastest: number
  currentBaseFee: number
  recommendedBaseFee: number
}

export const getV1GasFromEtherchain = async (): Promise<EtherchainGasPriceResultV1> => {
  const etherchainGasPrices = (await axios.get<EtherchainGasPriceResultV1>('https://www.etherchain.org/api/gasPriceOracle')).data
  return etherchainGasPrices
}
