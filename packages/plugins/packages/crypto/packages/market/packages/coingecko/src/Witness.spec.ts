import { XyoAccount } from '@xyo-network/account'

import { defaultCoins, defaultCurrencies } from './lib'
import { XyoCoingeckoCryptoMarketPayloadSchema, XyoCoingeckoCryptoMarketQueryPayloadSchema } from './Schema'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoCoingeckoCryptoMarketWitness({
      account: new XyoAccount(),
      query: {
        coins: defaultCoins,
        currencies: defaultCurrencies,
        schema: XyoCoingeckoCryptoMarketQueryPayloadSchema,
      },
      schema: 'network.xyo.crypto.market.coingecko.config',
      targetSchema: XyoCoingeckoCryptoMarketPayloadSchema,
    })
    const actual = await sut.observe()

    expect(actual.schema).toBe(XyoCoingeckoCryptoMarketPayloadSchema)
  })
})
