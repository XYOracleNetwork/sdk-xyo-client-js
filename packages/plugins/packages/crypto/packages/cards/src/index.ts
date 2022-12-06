export * from '@xyo-network/crypto-cards-game-payload-plugin'
export * from '@xyo-network/crypto-cards-move-payload-plugin'

import { XyoCryptoCardsGamePlugin } from '@xyo-network/crypto-cards-game-payload-plugin'
import { XyoCryptoCardsMovePlugin } from '@xyo-network/crypto-cards-move-payload-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoCryptoCardsPlugins: PayloadSetPluginFunc[] = [XyoCryptoCardsGamePlugin, XyoCryptoCardsMovePlugin]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoCardsPlugins
