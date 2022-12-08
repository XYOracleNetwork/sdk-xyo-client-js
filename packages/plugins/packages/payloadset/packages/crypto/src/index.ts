export * from '@xyo-network/crypto-cards-plugins'
export * from '@xyo-network/crypto-market-plugins'

import { XyoCryptoCardsPlugins } from '@xyo-network/crypto-cards-plugins'
import { XyoCryptoMarketPlugins } from '@xyo-network/crypto-market-plugins'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoCryptoPlugins: PayloadSetPluginFunc[] = [...XyoCryptoCardsPlugins, ...XyoCryptoMarketPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoPlugins
