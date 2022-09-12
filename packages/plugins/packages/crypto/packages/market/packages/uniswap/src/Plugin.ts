import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoUniswapCryptoMarketWitnessConfig } from './Config'
import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'
import { XyoUniswapCryptoMarketPayloadTemplate } from './Template'
import { XyoUniswapCryptoMarketWitness } from './Witness'

export const XyoUniswapCryptoMarketPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketWitnessConfig>({
    auto: true,
    schema: XyoUniswapCryptoMarketSchema,
    template: XyoUniswapCryptoMarketPayloadTemplate,
    witness: (config) => {
      return new XyoUniswapCryptoMarketWitness({
        ...config,
        schema: XyoUniswapCryptoMarketWitnessConfigSchema,
        targetSchema: XyoUniswapCryptoMarketSchema,
      })
    },
  })
