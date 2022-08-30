export * from '@xyo-network/crypto-cards-payload-plugins'
export * from '@xyo-network/crypto-market-payload-plugins'

import { XyoCryptoCardsPayloadPlugins } from '@xyo-network/crypto-cards-payload-plugins'
import { XyoCryptoMarketPayloadPlugins } from '@xyo-network/crypto-market-payload-plugins'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoCryptoPayloadPlugins: XyoPayloadPluginFunc[] = [...XyoCryptoCardsPayloadPlugins, ...XyoCryptoMarketPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoPayloadPlugins
