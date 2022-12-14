import { getDiviner } from './getDiviner'

describe('getCryptoMarketAssetDiviner', () => {
  it('gets the getCryptoMarketAssetDiviner', async () => {
    const diviner = await getDiviner()
    expect(diviner).toBeObject()
    expect(diviner.query).toBeFunction()
  })
})
