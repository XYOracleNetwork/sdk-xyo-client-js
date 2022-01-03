/*
import { assertEx } from '@xylabs/sdk-js'
import dotenv from 'dotenv'

import { testBoundWitness } from '../Test'
import { XyoArchivistBoundWitnessNeo4jSdk } from './BoundWitnessSdk'

test('checking happy path', async () => {
  dotenv.config()
  const sdk = new XyoArchivistBoundWitnessNeo4jSdk(
    assertEx(process.env.NEO4J_URL, 'Missing NEO4J_URL'),
    assertEx(process.env.NEO4J_USERNAME, 'Missing NEO4J_USERNAME'),
    assertEx(process.env.NEO4J_PASSWORD, 'Missing NEO4J_PASSWORD'),
    'test'
  )
  const bw = await sdk.insert(testBoundWitness)
  expect(bw).toBeDefined()
  const count = await sdk.fetchCount()
  expect(count).toBeGreaterThan(0)
}, 40000)
*/
