import axios from 'axios'

import { EthereumGasBlocknativeResponse } from '../Payload'

const url = 'https://api.blocknative.com/gasprices/blockprices'

const Authorization = '9d3e23c3-e31d-4f9c-9d7c-c579cb75d226'
const config = { headers: { Authorization } }

export const getGasFromBlocknative = async (): Promise<EthereumGasBlocknativeResponse> => {
  return (await axios.get<EthereumGasBlocknativeResponse>(url, config)).data
}
