import { delay } from '@xylabs/delay'
import { XyoWitness } from '@xyo-network/witness'

import { XyoDomainWitnessConfig } from './Config'
import { XyoDomainPayload } from './Payload'
import { XyoDomainSchema } from './Schema'

export class XyoDomainWitness extends XyoWitness<XyoDomainPayload, XyoDomainWitnessConfig> {
  override async observe(_payload: Partial<XyoDomainPayload>): Promise<XyoDomainPayload> {
    await delay(0)
    return { schema: XyoDomainSchema }
  }
  public static dmarc = '_xyo'

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }
}
