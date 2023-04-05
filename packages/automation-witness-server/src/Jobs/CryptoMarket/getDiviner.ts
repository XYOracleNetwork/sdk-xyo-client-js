import { XyoCryptoMarketAssetDiviner, XyoCryptoMarketAssetDivinerConfigSchema } from '@xyo-network/crypto-asset-plugin'

import { getAccount, WalletPaths } from '../../Account'

export const getDiviner = async () => {
  return await XyoCryptoMarketAssetDiviner.create({
    account: getAccount(WalletPaths.CryptoMarket.Diviner.Asset),
    config: {
      schema: XyoCryptoMarketAssetDivinerConfigSchema,
    },
  })
}
