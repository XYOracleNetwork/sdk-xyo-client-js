import { divineGas } from './divineGas'

describe('divineGas', () => {
  it('divines gas', () => {
    const result = divineGas()
    expect(result).toBeObject()
    expect(result.timestamp).toBeNumber()
  })
})
