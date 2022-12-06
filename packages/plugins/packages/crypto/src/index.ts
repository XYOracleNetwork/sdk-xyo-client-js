export * from '@xyo-network/crypto-cards-payload-plugins'
export * from '@xyo-network/crypto-market-payload-plugins'

import { XyoCryptoCardsPlugins } from '@xyo-network/crypto-cards-payload-plugins'
import { XyoCryptoMarketPlugins } from '@xyo-network/crypto-market-payload-plugins'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoCryptoPlugins: PayloadSetPluginFunc[] = [...XyoCryptoCardsPlugins, ...XyoCryptoMarketPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoCryptoPlugins
