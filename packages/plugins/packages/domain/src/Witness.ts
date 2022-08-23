import { delay } from '@xylabs/delay'
import { XyoWitness, XyoWitnessConfig, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoDomainPayload } from './Payload'
import { XyoDomainPayloadSchema } from './Schema'

export type XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'
export const XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'

export type XyoDomainWitnessConfig = XyoWitnessQueryPayload<{
  schema: XyoDomainWitnessConfigSchema
  domain: string
}>

export class XyoDomainWitness extends XyoWitness<XyoDomainPayload, XyoWitnessConfig<{ schema: XyoDomainWitnessConfigSchema }>> {
  override async observe(_payload: Partial<XyoDomainPayload>): Promise<XyoDomainPayload> {
    await delay(0)
    return { schema: XyoDomainPayloadSchema }
  }
  public static dmarc = '_xyo'

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }
}
