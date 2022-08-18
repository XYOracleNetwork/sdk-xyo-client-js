import { delay } from '@xylabs/delay'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoDomainPayload } from './Payload'
import { XyoDomainPayloadSchema } from './Schema'

export type XyoDomainWitnessQuerySchema = 'network.xyo.domain.witness.query'
export const XyoDomainWitnessQuerySchema = 'network.xyo.domain.witness.query'

export type XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'
export const XyoDomainWitnessConfigSchema = 'network.xyo.domain.witness.config'

export type XyoDomainWitnessQueryPayload = XyoWitnessQueryPayload<{ schema: XyoDomainWitnessQuerySchema; domain: string }>

export class XyoDomainWitness extends XyoWitness<XyoDomainPayload> {
  override async observe(
    _payload: Partial<XyoDomainPayload>,
    _query?: XyoWitnessQueryPayload<XyoPayload<{ schema: string }>> | undefined,
  ): Promise<XyoDomainPayload> {
    await delay(0)
    return { schema: XyoDomainPayloadSchema }
  }
  public static dmarc = '_xyo'

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }
}
