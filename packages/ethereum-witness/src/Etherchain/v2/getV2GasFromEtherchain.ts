import axios from 'axios'

export interface EtherchainGasPriceResultV2 {
  code: number
  data: {
    rapid: number
    fast: number
    standard: number
    slow: number
    timestamp: number
    priceUSD: number
  }
}

export const getV2GasFromEtherchain = async (): Promise<EtherchainGasPriceResultV2> => {
  const etherchainGasPrices = (await axios.get<EtherchainGasPriceResultV2>('https://www.etherchain.org/api/gasnow')).data
  return etherchainGasPrices
}
