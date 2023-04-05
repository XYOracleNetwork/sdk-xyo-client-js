import { getProvider } from '../../../Providers'
import { reportCryptoPrices } from '../reportCryptoPrices'

describe('reportCryptoPrices', () => {
  it('gets prices using supplied provider', async () => {
    const [bw, ...payloads] = await reportCryptoPrices(getProvider())
    expect(bw).toBeTruthy()
    expect(payloads.length).toBeGreaterThan(0)
  })
  it('gets prices using default provider if no provider supplied', async () => {
    const [bw, ...payloads] = await reportCryptoPrices()
    expect(bw).toBeTruthy()
    expect(payloads.length).toBeGreaterThan(0)
  })
})
