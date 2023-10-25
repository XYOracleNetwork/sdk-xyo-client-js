import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { DomainSchema } from '@xyo-network/domain-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { WitnessModule, WitnessParams } from '@xyo-network/witness-model'

import { DomainWitnessConfig, DomainWitnessConfigSchema } from './Config'

export type DomainWitnessParams = WitnessParams<AnyConfigSchema<DomainWitnessConfig>>
export class DomainWitness<TParams extends DomainWitnessParams = DomainWitnessParams> extends AbstractWitness<TParams> implements WitnessModule {
  static override configSchemas = [DomainWitnessConfigSchema]
  static dmarc = '_xyo'

  static generateDmarc(domain: string) {
    return `${DomainWitness.dmarc}.${domain}`
  }

  protected override observeHandler(_payload?: Payload[]): Promisable<Payload[]> {
    return [{ schema: DomainSchema }]
  }
}
