export * from '@xyo-network/crypto-cards-payload-plugins'
export * from '@xyo-network/crypto-market-payload-plugins'

import { XyoCryptoCardsPlugins } from '@xyo-network/crypto-cards-payload-plugins'
import { XyoCryptoMarketPlugins } from '@xyo-network/crypto-market-payload-plugins'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoCryptoPlugins: XyoPayloadPluginFunc[] = [...XyoCryptoCardsPlugins, ...XyoCryptoMarketPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoPlugins
