import { getName } from './getName'

describe('getName', () => {
  it('gets the unique identifier for this worker', () => {
    const name = getName()
    expect(name).toBeString()
  })
})
