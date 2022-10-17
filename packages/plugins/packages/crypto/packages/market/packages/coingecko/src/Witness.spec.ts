import { XyoWitnessConfig } from '@xyo-network/witness'

import { defaultCoins, defaultCurrencies } from './lib'
import { XyoCoingeckoCryptoMarketSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = await XyoCoingeckoCryptoMarketWitness.create({
      config: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: XyoCoingeckoCryptoMarketWitnessConfigSchema,
        targetSchema: XyoCoingeckoCryptoMarketSchema,
      } as XyoWitnessConfig,
    })
    const [actual] = await sut.observe()

    expect(actual.schema).toBe(XyoCoingeckoCryptoMarketSchema)
  })
})
