export * from '@xyo-network/crypto-cards-game-payload-plugin'
export * from '@xyo-network/crypto-cards-move-payload-plugin'

import { CryptoCardsGamePayloadPlugin } from '@xyo-network/crypto-cards-game-payload-plugin'
import { CryptoCardsMovePayloadPlugin } from '@xyo-network/crypto-cards-move-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoCryptoCardsPayloadPlugins: XyoPayloadPluginFunc[] = [CryptoCardsGamePayloadPlugin, CryptoCardsMovePayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoCardsPayloadPlugins
