import { getProvider } from '../../../Providers'
import { reportCryptoPrices } from '../reportCryptoPrices'

describe('reportCryptoPrices', () => {
  it('gets prices using supplied provider', () => {
    const prices = reportCryptoPrices(getProvider())
    expect(prices).toBeTruthy()
  })
  it('gets prices using default provider if no provider supplied', () => {
    const prices = reportCryptoPrices()
    expect(prices).toBeTruthy()
  })
})
