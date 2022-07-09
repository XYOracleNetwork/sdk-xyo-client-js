import axios from 'axios'

import { EtherchainGasPriceResultV1 } from './EtherchainGasPriceResultV1'

export const getV1GasFromEtherchain = async (): Promise<EtherchainGasPriceResultV1> => {
  const etherchainGasPrices = (await axios.get<EtherchainGasPriceResultV1>('https://www.etherchain.org/api/gasPriceOracle')).data
  return etherchainGasPrices
}
