import { XyoEthereumGasDiviner, XyoEthereumGasDivinerConfigSchema } from '@xyo-network/gas-price-plugin'
import { DivinerModule } from '@xyo-network/modules'

import { getAccount, WalletPaths } from '../../Account'

export const getDiviner = async (): Promise<DivinerModule> => {
  return await XyoEthereumGasDiviner.create({
    account: getAccount(WalletPaths.EthereumGas.Diviner.Price),
    config: {
      schema: XyoEthereumGasDivinerConfigSchema,
    },
  })
}
