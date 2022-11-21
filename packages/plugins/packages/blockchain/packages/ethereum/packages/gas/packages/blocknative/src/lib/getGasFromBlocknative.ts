import axios from 'axios'

import { EthereumGasBlocknativeResponse } from '../Payload'

export const getGasFromBlocknative = async (): Promise<EthereumGasBlocknativeResponse> => {
  const url = 'https://api.blocknative.com/gasprices/blockprices'
  return (await axios.get<EthereumGasBlocknativeResponse>(url)).data
}
