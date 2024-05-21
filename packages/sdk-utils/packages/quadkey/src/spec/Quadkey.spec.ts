import { Quadkey } from '../Quadkey'

describe('Quadkey', () => {
  test('Valid Items', () => {
    const qk = Quadkey.fromBase4String('0203')
    expect(qk.base16String).toBe('00000000000000000000000000000000000000000000000000000000000023')
    expect(qk.zoom).toBe(4)
    expect(qk.base4Hash).toBe('0203')
    const center = qk?.center
    expect(center?.lat).toBe(48.378_236)
    expect(center?.lng).toBe(-146.25)
  })
})
