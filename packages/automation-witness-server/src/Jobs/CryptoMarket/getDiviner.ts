import { CryptoMarketAssetDiviner, CryptoMarketAssetDivinerConfigSchema } from '@xyo-network/crypto-asset-plugin'
import { DirectDivinerModule } from '@xyo-network/diviner-model'

import { getAccount, WalletPaths } from '../../Account'

export const getDiviner = async (): Promise<DirectDivinerModule> => {
  return await CryptoMarketAssetDiviner.create({
    account: await getAccount(WalletPaths.CryptoMarket.Diviner.Asset),
    config: {
      schema: CryptoMarketAssetDivinerConfigSchema,
    },
  })
}
