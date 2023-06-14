export * from '@xyo-network/crypto-cards-plugins'
export * from '@xyo-network/crypto-market-plugins'

import { CryptoCardsPlugins } from '@xyo-network/crypto-cards-plugins'
import { CryptoMarketPlugins } from '@xyo-network/crypto-market-plugins'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const CryptoPlugins: PayloadSetPluginFunc[] = [...CryptoCardsPlugins, ...CryptoMarketPlugins]

// eslint-disable-next-line import/no-default-export
export default CryptoPlugins
