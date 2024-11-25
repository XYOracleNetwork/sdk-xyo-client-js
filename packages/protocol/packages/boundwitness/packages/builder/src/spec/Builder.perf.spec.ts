import '@xylabs/vitest-extended'

import type { AnyObject } from '@xylabs/object'
import { Account } from '@xyo-network/account'
import type { Payload } from '@xyo-network/payload'
import { PayloadBuilder } from '@xyo-network/payload'
import {
  describe, expect, it,
} from 'vitest'

import { BoundWitnessBuilder } from '../Builder.ts'

const schema = 'network.xyo.test'

const payloadsPromise = (async () =>
  await Promise.all(
    Array(5000)
      .fill(Math.random())
      .map(value => new PayloadBuilder<Payload<AnyObject>>({ schema }).fields({ value }).build()),
  ))()

describe('BoundWitnessBuilder-Perf', () => {
  it('build', async () => {
    const startTime = Date.now()
    const bw = new BoundWitnessBuilder()
      .payloads(await payloadsPromise)
      .signer(await Account.random())
      .build()
    const duration = Date.now() - startTime
    expect(bw).toBeDefined()
    expect(duration).toBeLessThan(10_000)
  })
})
