import axios from 'axios'

import { EtherchainGasPriceResultV2 } from './EtherchainGasPriceResultV2'

export const getV2GasFromEtherchain = async (): Promise<EtherchainGasPriceResultV2> => {
  const etherchainGasPrices = (await axios.get<EtherchainGasPriceResultV2>('https://www.etherchain.org/api/gasnow')).data
  return etherchainGasPrices
}
