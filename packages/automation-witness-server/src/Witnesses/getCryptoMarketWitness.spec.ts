import { getProvider } from '../Providers'
import { getCryptoMarketWitness } from './getCryptoMarketWitness'

describe('getCryptoMarketWitness', () => {
  it('gets witnesses using supplied provider', async () => {
    const panel = await getCryptoMarketWitness(getProvider())
    expect(panel).toBeArray()
  })
  it('gets witnesses using default provider if no provider supplied', async () => {
    const panel = await getCryptoMarketWitness()
    expect(panel).toBeArray()
  })
})
