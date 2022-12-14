import { getName } from './getName'

describe('getName', () => {
  it('gets the unique identifier for this worker', async () => {
    const name = await getName()
    expect(name).toBeString()
  })
})
