import axios from 'axios'

export interface EtherscanGasPriceSimple {
  status: string
  message: string
  result: {
    LastBlock: string
    SafeGasPrice: string
    ProposeGasPrice: string
    FastGasPrice: string
    suggestBaseFee: string
    gasUsedRatio: string
  }
}

const apiKey = process.env.ETHERSCAN_API_KEY

export const getGasFromEtherscan = async (): Promise<EtherscanGasPriceSimple> => {
  const gasPrices = (await axios.get<EtherscanGasPriceSimple>(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`)).data
  return gasPrices
}
