import { getNode } from './getNode'

describe('getNode', () => {
  it('returns a node', async () => {
    const node = await getNode()
    expect(node).toBeObject()
  })
})
