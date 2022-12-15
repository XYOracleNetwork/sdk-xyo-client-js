import { getProvider } from '../../Providers'
import { getWitnessPanel } from './getWitnessPanel'

describe('getWitnessPanel', () => {
  it('gets panel using supplied provider', () => {
    const panel = getWitnessPanel(getProvider())
    expect(panel).toBeTruthy()
  })
  it('gets panel using default provider if no provider supplied', () => {
    const panel = getWitnessPanel()
    expect(panel).toBeTruthy()
  })
})
