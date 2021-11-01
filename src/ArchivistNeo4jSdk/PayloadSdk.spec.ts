import { assertEx } from '@xyo-network/sdk-xyo-js'
import dotenv from 'dotenv'

import { testPayload } from '../Test'
import PayloadSdk from './PayloadSdk'

test('checking happy path', async () => {
  dotenv.config()
  const sdk = new PayloadSdk(
    assertEx(process.env.NEO4J_URL, 'Missing NEO4J_URL'),
    assertEx(process.env.NEO4J_USERNAME, 'Missing NEO4J_USERNAME'),
    assertEx(process.env.NEO4J_PASSWORD, 'Missing NEO4J_PASSWORD'),
    'test'
  )
  const payload = await sdk.insert(testPayload)
  expect(payload).toBeDefined()
  const count = await sdk.fetchCount()
  expect(count).toBeGreaterThan(0)
}, 40000)
