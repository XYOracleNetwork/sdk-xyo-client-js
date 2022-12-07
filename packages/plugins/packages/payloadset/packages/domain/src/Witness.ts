import { XyoDomainPayload, XyoDomainSchema } from '@xyo-network/domain-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness } from '@xyo-network/witness'

import { XyoDomainWitnessConfig, XyoDomainWitnessConfigSchema } from './Config'

export class XyoDomainWitness extends AbstractWitness<XyoDomainWitnessConfig> {
  static override configSchema = XyoDomainWitnessConfigSchema
  public static dmarc = '_xyo'

  static override async create(params?: XyoModuleParams<XyoDomainWitnessConfig>): Promise<XyoDomainWitness> {
    return (await super.create(params)) as XyoDomainWitness
  }

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }

  override async observe(_payload: XyoDomainPayload[]): Promise<XyoPayload[]> {
    return await super.observe([{ schema: XyoDomainSchema }])
  }
}
