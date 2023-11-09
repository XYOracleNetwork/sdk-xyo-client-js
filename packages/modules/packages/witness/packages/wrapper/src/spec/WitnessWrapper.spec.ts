import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { Account } from '@xyo-network/account'
import { Payload } from '@xyo-network/payload-model'
import { isWitnessInstance, WitnessConfigSchema } from '@xyo-network/witness-model'

import { WitnessWrapper } from '../WitnessWrapper'

class TestWitness extends AbstractWitness {
  protected override observeHandler(fields?: Payload[]): Promisable<Payload[]> {
    return [...(fields ?? []), { schema: 'network.xyo.test' }]
  }
}

describe('WitnessWrapper', () => {
  test('Is it a WitnessInstance', async () => {
    const witness = await TestWitness.create({
      account: Account.randomSync(),
      config: { schema: WitnessConfigSchema },
    })
    expect(isWitnessInstance(witness)).toBeTrue()
    const wrapper = WitnessWrapper.wrap(witness, Account.randomSync())
    expect(isWitnessInstance(wrapper)).toBeTrue()
  })
})
