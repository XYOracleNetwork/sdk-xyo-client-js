import { HDWallet } from '@xyo-network/account'

import { DomainWitnessConfigSchema } from '../Config'
import { DomainWitness } from '../Witness'

describe('DomainConfigWitness', () => {
  test('valid-instantiation', async () => {
    const witness = await DomainWitness.create({
      account: await HDWallet.random(),
      config: {
        domain: 'xyo.network',
        schema: DomainWitnessConfigSchema,
      },
    })
    expect(witness).toBeTruthy()
    expect(DomainWitness.dmarc).toBe('_xyo')
  })

  test('generatesDmarc', () => {
    expect(DomainWitness.generateDmarc('foo')).toBe('_xyo.foo')
  })
})
