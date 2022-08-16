import { XyoAccount } from '@xyo-network/account'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetQueryPayload } from './Query'
import { XyoCryptoMarketAssetPayloadSchema, XyoCryptoMarketAssetQueryPayloadSchema } from './Schema'

describe('Diviner', () => {
  test('returns observation', async () => {
    const sut = new XyoCryptoMarketAssetDiviner(XyoAccount.random())
    const query: XyoCryptoMarketAssetQueryPayload = {
      schema: XyoCryptoMarketAssetQueryPayloadSchema,
      targetSchema: XyoCryptoMarketAssetPayloadSchema,
    }
    const actual = await sut.divine(query)
    expect(actual).toBeTruthy()
    // TODO: Better assertions
  })
})
