import { testBoundWitness } from '../Test'
import BoundWitnessSdk from './BoundWitnessSdk'

test('checking happy path', async () => {
  const sdk = new BoundWitnessSdk(
    'neo4j+s://8a4b1e82.databases.neo4j.io',
    'neo4j',
    'TaoxEqelMH1N9Wv2_VSaghFV9mDCX0X-GH7N7H6qEU0',
    'test'
  )
  const count = await sdk.fetchCount()
  expect(count).toEqual(0)
  const bw = await sdk.insert(testBoundWitness)
  expect(bw).toBeDefined()
}, 40000)
