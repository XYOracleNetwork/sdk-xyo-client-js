import { delay } from '@xylabs/delay'
import { PartialWitnessConfig, XyoWitness } from '@xyo-network/witness'

import { XyoDomainWitnessConfig, XyoDomainWitnessConfigSchema } from './Config'
import { XyoDomainPayload } from './Payload'
import { XyoDomainSchema } from './Schema'

export class XyoDomainWitness extends XyoWitness<XyoDomainPayload, XyoDomainWitnessConfig> {
  constructor(config: PartialWitnessConfig<XyoDomainWitnessConfig>) {
    super({ schema: XyoDomainWitnessConfigSchema, targetSchema: XyoDomainSchema, ...config })
  }

  override async observe(_payload: Partial<XyoDomainPayload>[]): Promise<XyoDomainPayload[]> {
    await delay(0)
    return [{ schema: XyoDomainSchema }]
  }
  public static dmarc = '_xyo'

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }
}
