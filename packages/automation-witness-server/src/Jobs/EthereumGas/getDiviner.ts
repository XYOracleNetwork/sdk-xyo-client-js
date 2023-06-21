import { EthereumGasDiviner, EthereumGasDivinerConfigSchema } from '@xyo-network/gas-price-plugin'
import { DivinerModule } from '@xyo-network/modules'

import { getAccount, WalletPaths } from '../../Account'

export const getDiviner = async (): Promise<DivinerModule> => {
  return await EthereumGasDiviner.create({
    account: await getAccount(WalletPaths.EthereumGas.Diviner.Price),
    config: {
      schema: EthereumGasDivinerConfigSchema,
    },
  })
}
