/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */

import { AnyObject } from '@xylabs/object'
import { Account } from '@xyo-network/account'
import { Payload, PayloadBuilder } from '@xyo-network/payload'

import { BoundWitnessBuilder } from '../Builder'

const schema = 'network.xyo.test'

const payloadsPromise = (async () =>
  await Promise.all(
    Array(5000)
      .fill(Math.random())
      .map((value) => new PayloadBuilder<Payload<AnyObject>>({ schema }).fields({ value }).build()),
  ))()

describe('BoundWitnessBuilder-Perf', () => {
  it('build', async () => {
    const startTime = Date.now()
    const bw = (await new BoundWitnessBuilder().payloads(await payloadsPromise)).witness(Account.randomSync()).build()
    const duration = Date.now() - startTime
    expect(bw).toBeDefined()
    expect(duration).toBeLessThan(1000)
  })
})
