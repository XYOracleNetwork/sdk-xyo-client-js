import { getDiviner } from './getDiviner'

describe('getDiviner', () => {
  it('gets the diviner', async () => {
    const diviner = await getDiviner()
    expect(diviner).toBeObject()
    expect(diviner.query).toBeFunction()
  })
})
