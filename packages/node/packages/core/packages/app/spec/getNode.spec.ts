import { getNode } from '../src/getNode'

describe.skip('getNode', () => {
  it('returns a node', async () => {
    const node = await getNode()
    expect(node).toBeObject()
  })
})
