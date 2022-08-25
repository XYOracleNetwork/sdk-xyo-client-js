import { delay } from '@xylabs/delay'
import { XyoWitness } from '@xyo-network/witness'

import { XyoDomainWitnessConfig, XyoDomainWitnessConfigSchema } from './Config'
import { XyoDomainPayload } from './Payload'
import { XyoDomainPayloadSchema } from './Schema'

export class XyoDomainWitness extends XyoWitness<XyoDomainPayload, XyoDomainWitnessConfig> {
  constructor(config: Partial<XyoDomainWitnessConfig> & Pick<XyoDomainWitnessConfig, 'account' | 'domain'>) {
    super({ ...config, schema: XyoDomainWitnessConfigSchema, targetSchema: XyoDomainPayloadSchema })
  }

  override async observe(_payload: Partial<XyoDomainPayload>): Promise<XyoDomainPayload> {
    await delay(0)
    return { schema: XyoDomainPayloadSchema }
  }
  public static dmarc = '_xyo'

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }
}
