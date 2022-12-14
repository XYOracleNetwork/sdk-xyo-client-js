import { getProvider } from '../Providers'
import { getEthereumGasWitness } from './getEthereumGasWitness'

describe('getCryptoMarketWitness', () => {
  it('gets witnesses using supplied provider', async () => {
    const panel = await getEthereumGasWitness(getProvider())
    expect(panel).toBeArray()
  })
  it('gets witnesses using default provider if no provider supplied', async () => {
    const panel = await getEthereumGasWitness()
    expect(panel).toBeArray()
  })
})
