import { XyoAccount } from '@xyo-network/account'

import { defaultCoins, defaultCurrencies } from './lib'
import { XyoCoingeckoCryptoMarketPayloadSchema } from './Schema'
import { XyoCoingeckoCryptoMarketWitness } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoCoingeckoCryptoMarketWitness({
      account: new XyoAccount(),
      coins: defaultCoins,
      currencies: defaultCurrencies,
      schema: 'network.xyo.crypto.market.coingecko.witness.config',
      targetSchema: XyoCoingeckoCryptoMarketPayloadSchema,
    })
    const actual = await sut.observe()

    expect(actual.schema).toBe(XyoCoingeckoCryptoMarketPayloadSchema)
  })
})
