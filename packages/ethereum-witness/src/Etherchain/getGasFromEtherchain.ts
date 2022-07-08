import axios from 'axios'

interface EtherchainGasPriceOracle {
  safeLow: number
  standard: number
  fast: number
  fastest: number
  currentBaseFee: number
  recommendedBaseFee: number
}

export const getGasFromEtherchain = async (): Promise<EtherchainGasPriceOracle> => {
  const etherchainGasPrices = (await axios.get<EtherchainGasPriceOracle>('https://www.etherchain.org/api/gasPriceOracle')).data
  return etherchainGasPrices
}
