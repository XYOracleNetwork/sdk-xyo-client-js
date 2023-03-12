import { XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'

import { XyoDomainWitnessConfig, XyoDomainWitnessConfigSchema } from './Config'

export type DomainWitnessParams = WitnessParams<AnyConfigSchema<XyoDomainWitnessConfig>>
export class XyoDomainWitness<TParams extends DomainWitnessParams = DomainWitnessParams> extends AbstractWitness<TParams> implements WitnessModule {
  static override configSchema = XyoDomainWitnessConfigSchema
  static dmarc = '_xyo'

  static override async create<TParams extends DomainWitnessParams>(params?: TParams) {
    return (await super.create(params)) as XyoDomainWitness<TParams>
  }

  static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }

  override async observe(_payload?: XyoPayload[]): Promise<XyoPayload[]> {
    return await super.observe([{ schema: XyoDomainSchema }])
  }
}
