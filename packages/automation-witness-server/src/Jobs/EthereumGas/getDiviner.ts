import { DirectDivinerModule } from '@xyo-network/diviner-model'
import { EthereumGasDiviner, EthereumGasDivinerConfigSchema } from '@xyo-network/gas-price-plugin'

import { getAccount, WalletPaths } from '../../Account'

export const getDiviner = async (): Promise<DirectDivinerModule> => {
  return await EthereumGasDiviner.create({
    account: await getAccount(WalletPaths.EthereumGas.Diviner.Price),
    config: {
      schema: EthereumGasDivinerConfigSchema,
    },
  })
}
