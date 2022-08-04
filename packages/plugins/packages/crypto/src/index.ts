export * from '@xyo-network/all-crypto-cards-payload-plugins'
export * from '@xyo-network/all-crypto-market-payload-plugins'

import { XyoAllCryptoCardsPayloadPlugins } from '@xyo-network/all-crypto-cards-payload-plugins'
import { XyoAllCryptoMarketPayloadPlugins } from '@xyo-network/all-crypto-market-payload-plugins'

export const XyoAllCryptoPayloadPlugins = [...XyoAllCryptoCardsPayloadPlugins, ...XyoAllCryptoMarketPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoAllCryptoPayloadPlugins
