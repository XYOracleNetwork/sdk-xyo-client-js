import '@xylabs/vitest-extended'

import type { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Account } from '@xyo-network/account'
import type { Payload } from '@xyo-network/payload-model'
import { isWitnessInstance, WitnessConfigSchema } from '@xyo-network/witness-model'
import {
  describe, expect, test,
} from 'vitest'

import { WitnessWrapper } from '../WitnessWrapper.ts'

class TestWitness extends AbstractWitness {
  protected override observeHandler(fields?: Payload[]): Promisable<Payload[]> {
    return [...(fields ?? []), { schema: 'network.xyo.test' }]
  }
}

/**
 * @group witness
 * @group module
 */

describe('WitnessWrapper', () => {
  test('Is it a WitnessInstance', async () => {
    const witness = await TestWitness.create({
      account: 'random',
      config: { schema: WitnessConfigSchema },
    })
    expect(isWitnessInstance(witness)).toBeTrue()
    const wrapper = WitnessWrapper.wrap(witness, await Account.random())
    expect(isWitnessInstance(wrapper)).toBeTrue()
  })
})
