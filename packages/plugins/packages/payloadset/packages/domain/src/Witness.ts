import { XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'

import { XyoDomainWitnessConfig, XyoDomainWitnessConfigSchema } from './Config'

export class XyoDomainWitness extends AbstractWitness<WitnessParams<XyoDomainWitnessConfig>> implements WitnessModule {
  static override configSchema = XyoDomainWitnessConfigSchema
  static dmarc = '_xyo'

  static override async create(params?: ModuleParams<XyoDomainWitnessConfig>): Promise<XyoDomainWitness> {
    return (await super.create(params)) as XyoDomainWitness
  }

  static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }

  override async observe(_payload?: XyoPayload[]): Promise<XyoPayload[]> {
    return await super.observe([{ schema: XyoDomainSchema }])
  }
}
