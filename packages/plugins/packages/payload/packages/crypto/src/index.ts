export * from '@xyo-network/crypto-cards-payload-plugins'
export * from '@xyo-network/crypto-market-payload-plugins'

import { XyoCryptoCardsPayloadPlugins } from '@xyo-network/crypto-cards-payload-plugins'
import { XyoCryptoMarketPayloadPlugins } from '@xyo-network/crypto-market-payload-plugins'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const CryptoPayloadPlugins: PayloadPluginFunc[] = [...XyoCryptoCardsPayloadPlugins, ...XyoCryptoMarketPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default CryptoPayloadPlugins
