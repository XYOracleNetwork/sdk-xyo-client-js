import { getProvider } from '../../../Providers'
import { reportGasPrices } from '../reportGasPrices'

describe('reportGasPrices', () => {
  it('reports supplied provider', () => {
    const panel = reportGasPrices(getProvider())
    expect(panel).toBeTruthy()
  })
  it('reports using default provider if no provider supplied', () => {
    const panel = reportGasPrices()
    expect(panel).toBeTruthy()
  })
})
