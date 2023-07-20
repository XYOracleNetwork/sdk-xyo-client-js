import { AbstractWitness } from '@xyo-network/abstract-witness'
import { HDWallet } from '@xyo-network/account'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { isWitnessInstance } from '@xyo-network/witness-model'

import { WitnessWrapper } from '../WitnessWrapper'

class TestWitness extends AbstractWitness {
  protected override observeHandler(fields?: Payload[]): Promisable<Payload[]> {
    return [...(fields ?? []), { schema: 'network.xyo.test' }]
  }
}

describe('WitnessWrapper', () => {
  test('Is it a WitnessInstance', async () => {
    const witness = await TestWitness.create()
    expect(isWitnessInstance(witness)).toBeTrue()
    const wrapper = WitnessWrapper.wrap(witness, await HDWallet.random())
    expect(isWitnessInstance(wrapper)).toBeTrue()
  })
})
