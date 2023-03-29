import { XyoCryptoMarketAssetDiviner, XyoCryptoMarketAssetDivinerConfigSchema } from '@xyo-network/crypto-asset-plugin'

import { getAccount, WalletPaths } from '../../Account'

export const getDiviner = async () => {
  return await XyoCryptoMarketAssetDiviner.create({
    account: getAccount(WalletPaths.CryptoMarket.Diviner.CryptoMarketAssetDiviner),
    config: {
      schema: XyoCryptoMarketAssetDivinerConfigSchema,
    },
  })
}
