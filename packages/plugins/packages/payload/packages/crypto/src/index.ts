export * from '@xyo-network/crypto-cards-payload-plugins'
export * from '@xyo-network/crypto-market-payload-plugins'

import { CryptoCardsPayloadPlugins } from '@xyo-network/crypto-cards-payload-plugins'
import { CryptoMarketPayloadPlugins } from '@xyo-network/crypto-market-payload-plugins'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const CryptoPayloadPlugins: PayloadPluginFunc[] = [...CryptoCardsPayloadPlugins, ...CryptoMarketPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default CryptoPayloadPlugins
