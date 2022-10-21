import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema } from './Schema'
import { XyoUniswapCryptoMarketPayloadTemplate } from './Template'
import { XyoUniswapCryptoMarketWitness, XyoUniswapCryptoMarketWitnessParams } from './Witness'

export const XyoUniswapCryptoMarketPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketWitnessParams>({
    auto: true,
    schema: XyoUniswapCryptoMarketSchema,
    template: XyoUniswapCryptoMarketPayloadTemplate,
    witness: async (params) => {
      return await XyoUniswapCryptoMarketWitness.create(assertEx(params))
    },
  })
