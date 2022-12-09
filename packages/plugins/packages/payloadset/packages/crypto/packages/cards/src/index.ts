export * from '@xyo-network/crypto-cards-game-plugin'
export * from '@xyo-network/crypto-cards-move-plugin'

import { XyoCryptoCardsGamePlugin } from '@xyo-network/crypto-cards-game-plugin'
import { XyoCryptoCardsMovePlugin } from '@xyo-network/crypto-cards-move-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoCryptoCardsPlugins: PayloadSetPluginFunc[] = [XyoCryptoCardsGamePlugin, XyoCryptoCardsMovePlugin]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoCardsPlugins
