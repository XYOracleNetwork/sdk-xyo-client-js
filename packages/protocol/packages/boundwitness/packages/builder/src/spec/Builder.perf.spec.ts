/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */

import { Account } from '@xyo-network/account'
import { PayloadBuilder } from '@xyo-network/payload'

import { BoundWitnessBuilder } from '../Builder'

const schema = 'network.xyo.test'

const payloads = Array(5000)
  .fill(Math.random())
  .map((value) => new PayloadBuilder({ schema }).fields({ value }).build())

describe('BoundWitnessBuilder-Perf', () => {
  it('build', () => {
    const startTime = Date.now()
    const bw = new BoundWitnessBuilder().payloads(payloads).witness(Account.randomSync()).build()
    const duration = Date.now() - startTime
    expect(bw).toBeDefined()
    expect(duration).toBeLessThan(500)
  })
})
