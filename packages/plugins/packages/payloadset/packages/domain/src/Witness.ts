import { DomainSchema } from '@xyo-network/domain-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'

import { DomainWitnessConfig, DomainWitnessConfigSchema } from './Config'

export type DomainWitnessParams = WitnessParams<AnyConfigSchema<DomainWitnessConfig>>
export class DomainWitness<TParams extends DomainWitnessParams = DomainWitnessParams> extends AbstractWitness<TParams> implements WitnessModule {
  static override configSchemas = [DomainWitnessConfigSchema]
  static dmarc = '_xyo'

  static generateDmarc(domain: string) {
    return `${DomainWitness.dmarc}.${domain}`
  }

  override async observe(_payload?: Payload[]): Promise<Payload[]> {
    return await super.observe([{ schema: DomainSchema }])
  }
}
