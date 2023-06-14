export * from '@xyo-network/crypto-cards-game-payload-plugin'
export * from '@xyo-network/crypto-cards-move-payload-plugin'

import { CryptoCardsGamePayloadPlugin } from '@xyo-network/crypto-cards-game-payload-plugin'
import { CryptoCardsMovePayloadPlugin } from '@xyo-network/crypto-cards-move-payload-plugin'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const CryptoCardsPayloadPlugins: PayloadPluginFunc[] = [CryptoCardsGamePayloadPlugin, CryptoCardsMovePayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default CryptoCardsPayloadPlugins
