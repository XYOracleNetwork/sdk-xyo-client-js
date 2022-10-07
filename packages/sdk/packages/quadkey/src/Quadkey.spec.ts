import { Quadkey } from './Quadkey'

describe('Quadkey', () => {
  test('Valid Items', () => {
    const qk = Quadkey.fromBase4String('0203')
    const center = qk?.toCenter()
    expect(center?.lat).toBe(48.378236)
    expect(center?.lng).toBe(-146.25)
  })
})
