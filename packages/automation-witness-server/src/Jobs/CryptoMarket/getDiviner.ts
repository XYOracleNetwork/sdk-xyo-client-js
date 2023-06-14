import { CryptoMarketAssetDiviner, CryptoMarketAssetDivinerConfigSchema } from '@xyo-network/crypto-asset-plugin'

import { getAccount, WalletPaths } from '../../Account'

export const getDiviner = async () => {
  return await CryptoMarketAssetDiviner.create({
    account: getAccount(WalletPaths.CryptoMarket.Diviner.Asset),
    config: {
      schema: CryptoMarketAssetDivinerConfigSchema,
    },
  })
}
