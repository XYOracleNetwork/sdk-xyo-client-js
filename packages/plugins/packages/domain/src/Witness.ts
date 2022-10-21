import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'

import { XyoDomainWitnessConfig, XyoDomainWitnessConfigSchema } from './Config'
import { XyoDomainPayload } from './Payload'
import { XyoDomainSchema } from './Schema'

export class XyoDomainWitness extends XyoWitness<XyoDomainPayload, XyoDomainWitnessConfig> {
  static override async create(params?: XyoModuleParams<XyoDomainWitnessConfig>): Promise<XyoDomainWitness> {
    return (await super.create(params)) as XyoDomainWitness
  }

  override async observe(_payload: Partial<XyoDomainPayload>[]): Promise<XyoDomainPayload[]> {
    return await super.observe([{ schema: XyoDomainSchema }])
  }
  public static dmarc = '_xyo'

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }

  static override configSchema = XyoDomainWitnessConfigSchema
  static override targetSchema = XyoDomainSchema
}
