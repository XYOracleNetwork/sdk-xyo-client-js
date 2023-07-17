import { DivinerInstance } from '@xyo-network/diviner-model'
import { EthereumGasDiviner, EthereumGasDivinerConfigSchema } from '@xyo-network/gas-price-plugin'

import { getAccount, WalletPaths } from '../../Account'

export const getDiviner = async (): Promise<DivinerInstance> => {
  return await EthereumGasDiviner.create({
    account: await getAccount(WalletPaths.EthereumGas.Diviner.Price),
    config: {
      schema: EthereumGasDivinerConfigSchema,
    },
  })
}
