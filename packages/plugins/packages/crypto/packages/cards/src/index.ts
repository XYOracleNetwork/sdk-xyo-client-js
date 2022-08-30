export * from '@xyo-network/crypto-cards-game-payload-plugin'
export * from '@xyo-network/crypto-cards-move-payload-plugin'

import { XyoCryptoCardsGamePayloadPlugin } from '@xyo-network/crypto-cards-game-payload-plugin'
import { XyoCryptoCardsMovePayloadPlugin } from '@xyo-network/crypto-cards-move-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoCryptoCardsPayloadPlugins: XyoPayloadPluginFunc[] = [XyoCryptoCardsGamePayloadPlugin, XyoCryptoCardsMovePayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoCardsPayloadPlugins
